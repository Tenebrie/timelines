import { readFileSync } from 'node:fs'
import { spawn } from 'node:child_process'

const [script, ...selectors] = process.argv.slice(2)
const { subPackages } = JSON.parse(readFileSync('package.json', 'utf8'))

function matches(pkg, selector) {
	const pattern = selector.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '[^/]*')
	return new RegExp(`^${pattern}$`).test(pkg)
}

const targets = selectors.length
	? subPackages.filter((pkg) => selectors.some((selector) => matches(pkg, selector)))
	: subPackages

function run(pkg) {
	return new Promise((resolve) => {
		const chunks = []
		const child = spawn('npm', ['run', script, '--if-present'], {
			cwd: pkg,
			env: { ...process.env, FORCE_COLOR: '1' },
		})
		// Push stdout and stderr into one buffer in arrival order to preserve the
		// process's output exactly, then flush it as a single contiguous block on exit.
		child.stdout.on('data', (chunk) => chunks.push(chunk))
		child.stderr.on('data', (chunk) => chunks.push(chunk))
		child.on('close', (code) => {
			const header = Buffer.from(`\n\x1b[36m── ${pkg}\x1b[0m (exit ${code ?? 1})\n`)
			process.stdout.write(Buffer.concat([header, ...chunks]))
			resolve(code ?? 1)
		})
	})
}

console.log(`Running \x1b[36m${script}\x1b[0m for ${targets.length} packages in parallel...`)
const codes = await Promise.all(targets.map(run))
process.exit(codes.find((code) => code !== 0) ?? 0)
