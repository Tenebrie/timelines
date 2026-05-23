import { spawn } from 'node:child_process'
import { existsSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// Runs `tsc --watch` for every library (any sibling dir with its own tsconfig.json + typescript),
// rebuilding dist on source change so consuming services pick it up live. Lives in the library root
// and is mounted into the `library-build` dev service; add a new library and it's watched automatically.
const libraryDir = path.dirname(fileURLToPath(import.meta.url))

for (const entry of readdirSync(libraryDir, { withFileTypes: true })) {
	if (!entry.isDirectory()) continue
	const cwd = path.join(libraryDir, entry.name)
	const tsc = path.join(cwd, 'node_modules', 'typescript', 'bin', 'tsc')
	if (!existsSync(path.join(cwd, 'tsconfig.json')) || !existsSync(tsc)) continue
	console.info(`[library-build] watching ${entry.name}`)
	spawn(process.execPath, [tsc, '--watch', '--preserveWatchOutput'], { cwd, stdio: 'inherit' })
}
