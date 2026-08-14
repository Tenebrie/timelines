import { createHash, randomUUID } from 'node:crypto'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

import { PGlite } from '@electric-sql/pglite'

/**
 * Pre-boot database preparation: replays Rhea's Prisma migration history into
 * the embedded PGlite database, then applies the desktop defaults. Runs to
 * completion and closes the database before Rhea boots, so the adapter's own
 * PGlite instance opens the data directory alone.
 *
 * The migration files are plain Postgres SQL, and PGlite is real Postgres, so
 * they apply unchanged. Bookkeeping mirrors Prisma's own `_prisma_migrations`
 * table, so already-applied migrations are skipped and migrations added by
 * future branches are picked up automatically on the next launch.
 *
 * The seed step mirrors Rhea's `prisma/seed.ts` for parity with the cloud
 * deployment: one default Admin account (admin@localhost / q), guarded by
 * the DatabaseSeeded flag; every other account registers as a normal user
 * and the admin promotes as needed. Keep it in sync with seed.ts if that
 * ever changes — the password hash here is a precomputed bcrypt(cost 12)
 * of the same 'q'.
 */
const SEED_ADMIN_PASSWORD_HASH = '$2b$12$yOVLWhUtcIgyLxs0Z0TIZekbZAtqmSfVmz7o1DakZu3Q/Lp/KVMYK'

export async function prepareDatabase(migrationsDir, dataDir) {
	const db = new PGlite(dataDir)
	try {
		const migrations = await applyMigrations(db, migrationsDir)
		await seedDatabase(db)
		return migrations
	} finally {
		await db.close()
	}
}

async function seedDatabase(db) {
	const seeded = await db.query(`SELECT 1 FROM "Flags" WHERE "value" = 'DatabaseSeeded'`)
	if (seeded.rows.length > 0) return

	await db.query(
		`INSERT INTO "User" ("id", "email", "username", "password", "level")
			VALUES ($1, 'admin@localhost', 'Administrator', $2, 'Admin')
			ON CONFLICT ("email") DO NOTHING`,
		[randomUUID(), SEED_ADMIN_PASSWORD_HASH],
	)
	await db.query(`INSERT INTO "Flags" ("value") VALUES ('DatabaseSeeded')`)
	console.info('[echo-desktop] seeded default admin account (admin@localhost)')
}

async function applyMigrations(db, migrationsDir) {
	await db.exec(`
		CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
			"id" VARCHAR(36) PRIMARY KEY NOT NULL,
			"checksum" VARCHAR(64) NOT NULL,
			"finished_at" TIMESTAMPTZ,
			"migration_name" VARCHAR(255) NOT NULL,
			"logs" TEXT,
			"rolled_back_at" TIMESTAMPTZ,
			"started_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
			"applied_steps_count" INTEGER NOT NULL DEFAULT 0
		)
	`)
	const appliedRows = await db.query(
		'SELECT "migration_name" FROM "_prisma_migrations" WHERE "finished_at" IS NOT NULL',
	)
	const applied = new Set(appliedRows.rows.map((row) => row.migration_name))

	const migrations = readdirSync(migrationsDir)
		.filter((entry) => statSync(join(migrationsDir, entry)).isDirectory())
		.sort()

	let appliedCount = 0
	for (const migration of migrations) {
		if (applied.has(migration)) continue
		const sqlPath = join(migrationsDir, migration, 'migration.sql')
		if (!existsSync(sqlPath)) continue

		const sql = readFileSync(sqlPath, 'utf8')
		try {
			await db.exec(sql)
		} catch (error) {
			// Multi-statement exec runs as one implicit transaction; a few
			// Postgres DDL forms (e.g. ALTER TYPE ... ADD VALUE) refuse
			// that. Fall back to statement-by-statement execution.
			await applyStatementByStatement(db, sql, migration, error)
		}
		await db.query(
			'INSERT INTO "_prisma_migrations" ("id", "checksum", "finished_at", "migration_name", "applied_steps_count") VALUES ($1, $2, now(), $3, 1)',
			[randomUUID(), createHash('sha256').update(sql).digest('hex'), migration],
		)
		appliedCount++
	}
	return { total: migrations.length, applied: appliedCount }
}

async function applyStatementByStatement(db, sql, migration, originalError) {
	console.warn(
		`[echo-desktop] migration ${migration}: batch apply failed (${originalError.message}), retrying statement-by-statement`,
	)
	// Prisma-generated migration files hold newline-terminated statements,
	// each prefixed with `-- Comment` lines that must be stripped per line —
	// a chunk-level comment filter would discard the statement beneath it.
	const statements = sql
		.split(/;\s*[\r\n]/)
		.map((chunk) =>
			chunk
				.split('\n')
				.filter((line) => !line.trim().startsWith('--'))
				.join('\n')
				.trim(),
		)
		.filter((statement) => statement.length > 0)
	if (statements.length === 0) {
		throw new Error(`[echo-desktop] migration ${migration}: fallback found no executable statements`)
	}
	for (const statement of statements) {
		try {
			await db.exec(statement)
		} catch (error) {
			throw new Error(
				`[echo-desktop] migration ${migration} failed on statement: ${statement.slice(0, 200)}\n${error.message}`,
			)
		}
	}
}
