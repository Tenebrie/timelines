import { execSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const libraryDir = path.dirname(fileURLToPath(import.meta.url))

// Discover all packages in sibling directories
const packages = []
for (const entry of readdirSync(libraryDir, { withFileTypes: true })) {
	if (!entry.isDirectory()) continue
	const pkgPath = path.join(libraryDir, entry.name, 'package.json')
	if (!existsSync(pkgPath)) continue
	const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'))
	const allDeps = [
		...Object.keys(pkg.dependencies ?? {}),
		...Object.keys(pkg.devDependencies ?? {}),
		...Object.keys(pkg.peerDependencies ?? {}),
	]
	packages.push({ name: pkg.name, dir: path.join(libraryDir, entry.name), deps: allDeps })
}

const byName = new Map(packages.map((p) => [p.name, p]))

// Build intra-library dependency graph
const inDegree = new Map(packages.map((p) => [p.name, 0]))
const dependents = new Map(packages.map((p) => [p.name, []]))
for (const pkg of packages) {
	for (const dep of pkg.deps) {
		if (!byName.has(dep)) continue
		inDegree.set(pkg.name, inDegree.get(pkg.name) + 1)
		dependents.get(dep).push(pkg.name)
	}
}

// Kahn's algorithm for topological sort
const queue = packages.filter((p) => inDegree.get(p.name) === 0).map((p) => p.name)
const order = []
while (queue.length > 0) {
	const name = queue.shift()
	order.push(name)
	for (const dependent of dependents.get(name)) {
		const deg = inDegree.get(dependent) - 1
		inDegree.set(dependent, deg)
		if (deg === 0) queue.push(dependent)
	}
}

if (order.length !== packages.length) {
	console.error('[ci-build] circular dependency detected among library packages')
	process.exit(1)
}

console.info(`[ci-build] build order: ${order.join(' → ')}`)
for (const name of order) {
	const pkg = byName.get(name)
	console.info(`\n[ci-build] building ${name}`)
	execSync('npm run build', { cwd: pkg.dir, stdio: 'inherit' })
}
