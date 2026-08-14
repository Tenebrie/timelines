import { randomBytes } from 'node:crypto'
import { createWriteStream, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { register } from 'node:module'
import os from 'node:os'
import { join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { inspect } from 'node:util'

import { installDnsRemap } from './dns-remap.mjs'
import { runMigrations } from './migrate.mjs'
import { startRouter } from './router.mjs'

/**
 * Boots the full Neverkin stack standalone in a single process:
 *
 *   1. Point the docker service hostnames at loopback (DNS remap).
 *   2. Apply Rhea's Prisma migrations to the embedded PGlite database.
 *   3. Register the ESM loader hook that swaps `redis` and
 *      `@prisma/adapter-pg` for the desktop shims.
 *   4. Import the unmodified Rhea and Calliope production builds
 *      (they bind ports 3000/3001 exactly as in docker).
 *   5. Serve the Styx static build + proxy /api and /live on one origin.
 *
 * Usable headless (`node src/launcher.mjs`) or from the Electron shell.
 */
// The services are resolved as siblings of this package's directory. In the
// repo that parent is <repo>/app; in a packaged build it is the staging dir
// (resources/) with the same folder names — one layout rule for both.
const servicesRoot = join(fileURLToPath(new URL('.', import.meta.url)), '..', '..')
const rheaDir = join(servicesRoot, 'rhea-backend')
const calliopeDir = join(servicesRoot, 'calliope-websockets')
const styxBuildDir = join(servicesRoot, 'styx-frontend', 'build')

function ensureEnvironment(dataDir) {
	mkdirSync(dataDir, { recursive: true })

	// Stable per-installation JWT secret so sessions survive restarts
	const secretPath = join(dataDir, 'jwt-secret')
	if (!existsSync(secretPath)) {
		writeFileSync(secretPath, randomBytes(32).toString('hex'), { mode: 0o600 })
	}

	const defaults = {
		NODE_ENV: 'production',
		jwt_secret: readFileSync(secretPath, 'utf8').trim(),
		environment: 'development',
		// S3 config must exist at boot (read at module load); the hostname
		// resolves to loopback where nothing listens, so asset features fail
		// fast and loud instead of hanging. Assets are out of desktop scope.
		s3_endpoint: 'http://s3-minio:9000',
		s3_bucket_id: 'bucket',
		s3_access_key_id: 'desktop',
		s3_access_key_secret: 'desktop',
		// Read by DatabaseClient but ignored: the adapter shim swaps in PGlite
		DATABASE_URL: 'postgresql://desktop:desktop@localhost:5432/desktop',
		NEVERKIN_PGDATA: join(dataDir, 'pgdata'),
	}
	for (const [key, value] of Object.entries(defaults)) {
		if (!process.env[key]) process.env[key] = value
	}
}

export async function startDesktopServices() {
	const dataDir = process.env.NEVERKIN_DESKTOP_DATA || join(os.homedir(), '.neverkin')
	const port = Number(process.env.NEVERKIN_DESKTOP_PORT || 8190)

	mkdirSync(dataDir, { recursive: true })
	// In a packaged app nobody sees the console; the shims' drift warnings and
	// crash logs must survive somewhere a bug report can quote.
	mirrorConsoleToFile(join(dataDir, 'log.txt'))

	console.info(`[echo-desktop] data directory: ${dataDir}`)
	console.info(`[echo-desktop] services root: ${servicesRoot}`)

	// Beta policy: any error that escapes to the process level is critical —
	// surface it in the user's face and exit rather than continue in an
	// unknown state. A crash is recoverable; corrupted data is not.
	process.on('unhandledRejection', failLoudly('unhandled rejection'))
	process.on('uncaughtException', failLoudly('uncaught exception'))
	ensureEnvironment(dataDir)
	installDnsRemap()

	console.info('[echo-desktop] applying database migrations...')
	const migrationResult = await runMigrations(
		join(rheaDir, 'prisma', 'migrations'),
		process.env.NEVERKIN_PGDATA,
	)
	console.info(
		`[echo-desktop] migrations: ${migrationResult.applied} applied, ${migrationResult.total} total`,
	)

	// Packaged builds ship esbuild bundles with the shims compiled in; the
	// dev/headless mode runs the raw dist output through ESM loader hooks.
	const bundleDir = join(fileURLToPath(new URL('.', import.meta.url)), '..', 'bundles')
	const useBundles = existsSync(join(bundleDir, 'rhea.mjs'))
	if (!useBundles) {
		register(pathToFileURL(join(fileURLToPath(new URL('.', import.meta.url)), 'loader-hooks.mjs')))
	}

	// Rhea resolves ./dist/apiSpec.json relative to the working directory
	process.chdir(rheaDir)

	console.info(`[echo-desktop] starting Rhea (API) on :3000${useBundles ? ' [bundled]' : ''}...`)
	await import(
		pathToFileURL(useBundles ? join(bundleDir, 'rhea.mjs') : join(rheaDir, 'dist', 'src', 'index.js'))
	)
	if (!globalThis.__NEVERKIN_DESKTOP_TX_WRAP__) {
		throw new Error(
			'[echo-desktop] the Prisma transaction-limits wrapper was not applied — ' +
				'the generated client path no longer matches; update the redirects in ' +
				'loader-hooks.mjs and bundle-backends.mjs (see prisma-client-wrap.mjs)',
		)
	}

	console.info('[echo-desktop] starting Calliope (realtime) on :3001...')
	await import(
		pathToFileURL(useBundles ? join(bundleDir, 'calliope.mjs') : join(calliopeDir, 'dist', 'index.js'))
	)

	await startRouter({ staticRoot: styxBuildDir, port })
	const url = `http://127.0.0.1:${port}`
	console.info(`[echo-desktop] ready: ${url}`)
	return { url, port, dataDir }
}

const isDirectRun = process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url
if (isDirectRun) {
	startDesktopServices().catch((error) => {
		console.error('[echo-desktop] failed to start:', error)
		process.exit(1)
	})
}

function failLoudly(kind) {
	return async (error) => {
		console.error(`[echo-desktop] ${kind}, exiting:`, error)
		if (process.versions.electron) {
			const { dialog } = await import('electron')
			dialog.showErrorBox('Neverkin hit a critical error', String(error?.stack ?? error))
		}
		process.exit(1)
	}
}

function mirrorConsoleToFile(logPath) {
	const stream = createWriteStream(logPath, { flags: 'a' })
	for (const level of ['log', 'info', 'warn', 'error']) {
		const original = console[level].bind(console)
		console[level] = (...args) => {
			original(...args)
			const line = args.map((arg) => (typeof arg === 'string' ? arg : inspect(arg))).join(' ')
			stream.write(`${new Date().toISOString()} [${level}] ${line}\n`)
		}
	}
}
