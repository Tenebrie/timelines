import { randomBytes } from 'node:crypto'
import {
	createWriteStream,
	existsSync,
	mkdirSync,
	readFileSync,
	renameSync,
	rmSync,
	statSync,
	writeFileSync,
} from 'node:fs'
import { register } from 'node:module'
import os from 'node:os'
import { join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { inspect } from 'node:util'

import { installDnsRemap } from './dns-remap.mjs'
import { prepareDatabase } from './migrate.mjs'
import { installPortRemap } from './port-remap.mjs'
import { startRouter } from './router.mjs'
import { startS3Server } from './s3-shim.mjs'

/**
 * Boots the full Neverkin stack standalone in a single process:
 *
 *   1. Point the docker service hostnames at loopback (DNS remap) and
 *      virtualize their hardcoded ports (port remap) so nothing collides
 *      with other software on the machine.
 *   2. Apply Rhea's Prisma migrations to the embedded PGlite database.
 *   3. Register the ESM loader hook that swaps `redis` and
 *      `@prisma/adapter-pg` for the desktop shims.
 *   4. Import the unmodified Rhea and Calliope production builds.
 *   5. Serve the Styx static build + proxy /api and /live on one origin.
 *
 * Usable headless (`node src/launcher.mjs`) or from the Electron shell.
 */
// The services are resolved as siblings of this package's directory. In the
// repo that parent is <repo>/app; in a packaged build it is the staging dir
// (resources/) with the same folder names — one layout rule for both.
const LOG_ROTATE_BYTES = 5 * 1024 * 1024
const LOG_SESSION_CAP_BYTES = 20 * 1024 * 1024

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
		// Read at module load; dns-remap + port-remap route this hostname to
		// the local filesystem-backed S3 shim (s3-shim.mjs)
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
	const dataDir = process.env.NEVERKIN_DESKTOP_DATA || defaultDataDir()
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
	// Rhea, Calliope and the S3 config hardcode ports 3000/3001/9000; bind
	// random loopback ports instead so the desktop app coexists with dev
	// stacks and other software
	const services = installPortRemap([3000, 3001, 9000])

	console.info('[echo-desktop] starting local asset storage (S3)...')
	await startS3Server({ storageRoot: join(dataDir, 's3') })
	const bucketPort = await services.whenBound(9000)

	console.info('[echo-desktop] preparing database...')
	const migrationResult = await prepareDatabase(
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

	console.info(`[echo-desktop] starting Rhea (API)${useBundles ? ' [bundled]' : ''}...`)
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
	const rheaPort = await services.whenBound(3000)
	console.info(`[echo-desktop] Rhea listening on 127.0.0.1:${rheaPort}`)

	console.info('[echo-desktop] starting Calliope (realtime)...')
	await import(
		pathToFileURL(useBundles ? join(bundleDir, 'calliope.mjs') : join(calliopeDir, 'dist', 'index.js'))
	)
	const calliopePort = await services.whenBound(3001)
	console.info(`[echo-desktop] Calliope listening on 127.0.0.1:${calliopePort}`)

	const server = await startRouter({
		staticRoot: styxBuildDir,
		port,
		rheaPort,
		calliopePort,
		bucketPort,
		fallbackToRandomPort: !process.env.NEVERKIN_DESKTOP_PORT,
	})
	const url = `http://127.0.0.1:${server.address().port}`
	console.info(`[echo-desktop] ready: ${url}`)
	return { url, port: server.address().port, dataDir }
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

/** Per-platform user data location; overridable with NEVERKIN_DESKTOP_DATA. */
function defaultDataDir() {
	if (process.platform === 'win32') {
		// Local, not Roaming: the database and assets can grow large and
		// should not sync across domain profiles
		return join(process.env.LOCALAPPDATA || join(os.homedir(), 'AppData', 'Local'), 'Neverkin')
	}
	if (process.platform === 'darwin') {
		return join(os.homedir(), 'Library', 'Application Support', 'Neverkin')
	}
	return join(process.env.XDG_DATA_HOME || join(os.homedir(), '.local', 'share'), 'neverkin')
}

function mirrorConsoleToFile(logPath) {
	if (existsSync(logPath) && statSync(logPath).size > LOG_ROTATE_BYTES) {
		const previousPath = logPath.replace(/\.txt$/, '.prev.txt')
		rmSync(previousPath, { force: true })
		renameSync(logPath, previousPath)
	}
	const stream = createWriteStream(logPath, { flags: 'a' })
	let written = 0
	for (const level of ['log', 'info', 'warn', 'error']) {
		const original = console[level].bind(console)
		console[level] = (...args) => {
			original(...args)
			if (written > LOG_SESSION_CAP_BYTES) return
			const line = args.map((arg) => (typeof arg === 'string' ? arg : inspect(arg))).join(' ')
			written += line.length
			stream.write(
				written > LOG_SESSION_CAP_BYTES
					? `${new Date().toISOString()} [warn] [echo-desktop] log capped for this session\n`
					: `${new Date().toISOString()} [${level}] ${line}\n`,
			)
		}
	}
}
