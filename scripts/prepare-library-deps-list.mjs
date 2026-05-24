import { readFileSync } from 'node:fs'

// Emits `--watch <lib>/dist` for each @neverkin/* file: dependency declared in the calling service's
// package.json, so a library rebuild restarts only the services that actually consume that library.
// Consumed via shell substitution in each backend's `start` script:
//   nodemon --watch src $(node /scripts/prepare-library-deps-list.mjs) --exec 'tsx src/index.ts' ...
// Run from the service directory (cwd holds the package.json to inspect).

const pkg = JSON.parse(readFileSync('package.json', 'utf8'))
const deps = { ...pkg.dependencies, ...pkg.devDependencies }

const watchArgs = Object.entries(deps)
	.filter(([name, spec]) => name.startsWith('@neverkin/') && String(spec).startsWith('file:'))
	.flatMap(([, spec]) => ['--watch', `${String(spec).slice('file:'.length)}/dist`])

process.stdout.write(watchArgs.join(' '))
