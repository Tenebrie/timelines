import { execSync, spawn } from 'node:child_process'
import { existsSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// Runs `tsc --watch` for every library (any sibling dir with its own tsconfig.json + typescript),
// rebuilding dist on source change so consuming services pick it up live. Lives in the library root
// and is mounted into the `library-build` dev service; add a new library and it's watched automatically.
const libraryDir = path.dirname(fileURLToPath(import.meta.url))

// Watchers start in parallel and have no inter-library ordering, so a package that depends on a
// sibling (e.g. esoteric-date → @neverkin/openapi-fetch) would compile against a missing/stale dist
// on first run. Do one full dependency-ordered build up front so every dist exists before we watch.
execSync(`${process.execPath} ${path.join(libraryDir, 'ci-build.mjs')}`, { stdio: 'inherit' })

for (const entry of readdirSync(libraryDir, { withFileTypes: true })) {
	if (!entry.isDirectory()) continue
	const cwd = path.join(libraryDir, entry.name)
	const tsc = path.join(cwd, 'node_modules', 'typescript', 'bin', 'tsc')
	if (!existsSync(tsc)) {
		console.info(`[library-build] skipping ${entry.name} due to missing typescript`)
		continue
	}
	if (!existsSync(path.join(cwd, 'tsconfig.json'))) {
		console.info(`[library-build] skipping ${entry.name} due to missing tsconfig.json`)
		continue
	}
	console.info(`[library-build] watching ${entry.name}`)
	const child = spawn(process.execPath, [tsc, '--watch', '--preserveWatchOutput'], { cwd, stdio: 'inherit' })
	child.on('error', (err) => console.error(`[library-build] failed to start ${entry.name}:`, err))
	child.on('exit', (code) => {
		if (code !== 0) console.error(`[library-build] watcher for ${entry.name} exited with code ${code}`)
	})
}
