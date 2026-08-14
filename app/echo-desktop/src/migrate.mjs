import { createHash, randomUUID } from 'node:crypto'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

import { PGlite } from '@electric-sql/pglite'

/**
 * Replays Rhea's Prisma migration history into the embedded PGlite database.
 * The migration files are plain Postgres SQL, and PGlite is real Postgres, so
 * they apply unchanged. Bookkeeping mirrors Prisma's own `_prisma_migrations`
 * table, so already-applied migrations are skipped and migrations added by
 * future branches are picked up automatically on the next launch.
 *
 * Runs to completion and closes the database before Rhea boots, so the
 * adapter's own PGlite instance opens the data directory alone.
 */
export async function runMigrations(migrationsDir, dataDir) {
	const db = new PGlite(dataDir)
	try {
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
	} finally {
		await db.close()
	}
}

async function applyStatementByStatement(db, sql, migration, originalError) {
	console.warn(
		`[echo-desktop] migration ${migration}: batch apply failed (${originalError.message}), retrying statement-by-statement`,
	)
	// Prisma-generated migration files hold newline-terminated statements; a
	// naive split is sufficient for them and only used as a fallback path.
	const statements = sql
		.split(/;\s*[\r\n]/)
		.map((statement) => statement.trim())
		.filter((statement) => statement.length > 0 && !statement.startsWith('--'))
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
