import { execSync } from 'node:child_process'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * Rebuilds every upstream artifact the desktop mode consumes, using each
 * app's own unmodified build pipeline. Run this after pulling or merging —
 * the desktop mode picks up new features, migrations and API changes with
 * no changes of its own.
 */
const repoRoot = join(fileURLToPath(new URL('.', import.meta.url)), '..', '..', '..')

function run(command, cwd) {
	console.info(`\n[build-upstream] ${command} (in ${cwd})`)
	execSync(command, { cwd, stdio: 'inherit' })
}

run('node library/ci-build.mjs', repoRoot)
run('npm run build', join(repoRoot, 'app', 'rhea-backend'))
run('npx moonflower openapi dist/apiSpec.json', join(repoRoot, 'app', 'rhea-backend'))
run('npm run build', join(repoRoot, 'app', 'calliope-websockets'))
run('npm run build', join(repoRoot, 'app', 'styx-frontend'))

console.info('\n[build-upstream] done')
