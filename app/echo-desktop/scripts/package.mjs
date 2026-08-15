import { execSync } from 'node:child_process'
import {
	cpSync,
	existsSync,
	mkdirSync,
	readdirSync,
	readFileSync,
	renameSync,
	rmSync,
	writeFileSync,
} from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { bundleBackends, EXTERNALS } from './bundle-backends.mjs'

/**
 * Produces a self-contained desktop build:
 *
 *   dist/package/neverkin-desktop-<platform>-<arch>/
 *   dist/package/neverkin-desktop-<platform>-<arch>.zip|.tar.gz
 */
const desktopDir = join(fileURLToPath(new URL('.', import.meta.url)), '..')
const repoRoot = join(desktopDir, '..', '..')
const target = `neverkin-desktop-${process.platform}-${process.arch}`
const outRoot = join(desktopDir, 'dist/package')
const stage = join(outRoot, target)
const resources = join(stage, 'resources')

function run(command, cwd) {
	console.info(`[package] ${command}`)
	execSync(command, { cwd, stdio: 'inherit' })
}

function copy(from, to) {
	mkdirSync(join(to, '..'), { recursive: true })
	cpSync(from, to, { recursive: true, dereference: true })
}

/**
 * Copies `rootDeps` and their full runtime dependency closure from
 * `baseModules` into `destModules`.
 */
function copyDependencyClosure(baseModules, rootDeps, destModules) {
	const pending = [...rootDeps]
	const seen = new Set()
	while (pending.length > 0) {
		const dep = pending.pop()
		if (seen.has(dep)) continue
		seen.add(dep)
		const depDir = join(baseModules, dep)
		if (!existsSync(depDir)) {
			console.warn(`[package] dependency ${dep} not found under ${baseModules}, skipping`)
			continue
		}
		copy(depDir, join(destModules, dep))
		const depPkg = JSON.parse(readFileSync(join(depDir, 'package.json'), 'utf8'))
		// peers are intentionally excluded: the bundles inline them already
		// (e.g. the adapter's @prisma/client peer ships inside rhea.mjs)
		for (const group of ['dependencies', 'optionalDependencies']) {
			for (const name of Object.keys(depPkg[group] ?? {})) {
				if (group === 'optionalDependencies' && isForeignPlatformVariant(name)) continue
				if (group === 'dependencies' || existsSync(join(baseModules, name))) pending.push(name)
			}
		}
	}
}

console.info(`[package] bundling backends...`)
await bundleBackends()

console.info(`[package] staging ${target}...`)
rmSync(stage, { recursive: true, force: true })
mkdirSync(resources, { recursive: true })

// 1. Electron runtime, trimmed to the English locale
if (process.platform === 'darwin') {
	throw new Error(
		'[package] macOS packaging is not implemented — the Electron.app bundle needs renaming and Info.plist edits (electron-builder territory)',
	)
}
const electronDist = join(desktopDir, 'node_modules', 'electron', 'dist')
if (!existsSync(electronDist)) {
	// npm tree rewrites and CI caches restore the electron package without
	// running its postinstall (which downloads the actual binary) — self-heal
	const installScript = join(desktopDir, 'node_modules', 'electron', 'install.js')
	if (!existsSync(installScript)) {
		throw new Error('[package] electron is not installed — run npm install in app/echo-desktop first')
	}
	console.info('[package] electron binary missing, downloading...')
	run(`node ${installScript}`, desktopDir)
}
copy(electronDist, stage)
rmSync(join(resources, 'default_app.asar'), { force: true })
const exeSuffix = process.platform === 'win32' ? '.exe' : ''
renameSync(join(stage, `electron${exeSuffix}`), join(stage, `neverkin${exeSuffix}`))
const localesDir = join(stage, 'locales')
if (existsSync(localesDir)) {
	for (const locale of readdirSync(localesDir)) {
		if (locale !== 'en-US.pak') rmSync(join(localesDir, locale), { force: true })
	}
}

// 2. The desktop package (resources/app is what Electron boots)
const appDir = join(resources, 'app')
copy(join(desktopDir, 'src'), join(appDir, 'src'))
copy(join(desktopDir, 'assets'), join(appDir, 'assets'))
copy(join(desktopDir, 'dist/bundles'), join(appDir, 'bundles'))
const pkg = JSON.parse(readFileSync(join(desktopDir, 'package.json'), 'utf8'))
writeFileSync(
	join(appDir, 'package.json'),
	JSON.stringify({ name: pkg.name, version: pkg.version, main: pkg.main, type: pkg.type }, null, '\t'),
)

// 3. Native/WASM packages the bundles left external: the desktop shim deps
// from this package's install, sharp/bcrypt from Rhea's install.
const appModules = join(appDir, 'node_modules')
copyDependencyClosure(join(desktopDir, 'node_modules'), Object.keys(pkg.dependencies), appModules)
const rheaSource = join(repoRoot, 'app', 'rhea-backend')
copyDependencyClosure(
	join(rheaSource, 'node_modules'),
	EXTERNALS.filter(
		(dep) => existsSync(join(rheaSource, 'node_modules', dep)) && !existsSync(join(appModules, dep)),
	),
	appModules,
)

// 4. Rhea's build output and database definitions, wholesale — Rhea resolves
// ./dist/* from its working directory and the launcher replays the migrations
const rheaStage = join(resources, 'rhea-backend')
copy(join(rheaSource, 'dist'), join(rheaStage, 'dist'))
copy(join(rheaSource, 'prisma'), join(rheaStage, 'prisma'))

// 5. Styx static build
copy(join(repoRoot, 'app', 'styx-frontend', 'build'), join(resources, 'styx-frontend', 'build'))

// 6. User-facing readme + archive
const runCommand = process.platform === 'win32' ? 'neverkin.exe' : './neverkin'
const dataLocation = process.platform === 'win32' ? '%LOCALAPPDATA%\\Neverkin' : '~/.local/share/neverkin'
writeFileSync(
	join(stage, 'README.txt'),
	[
		'Neverkin Desktop',
		'',
		`Run ${runCommand} to start. All data is stored locally in ${dataLocation}`,
		...(process.platform === 'linux'
			? [
					'',
					'If the app does not start (sandbox error on some Linux setups), run:',
					'  ./neverkin --no-sandbox',
				]
			: []),
		'',
	].join('\n'),
)

// zip updates archives in place, so stale entries from a previous run would
// survive — always start from a clean file
rmSync(join(outRoot, `${target}.zip`), { force: true })
rmSync(join(outRoot, `${target}.tar.gz`), { force: true })
if (process.platform === 'win32') {
	const bsdtar = join(process.env.SystemRoot ?? 'C:\\Windows', 'System32', 'tar.exe')
	run(`"${bsdtar}" --options zip:compression=deflate -a -c -f ${target}.zip ${target}`, outRoot)
} else {
	run(`tar -czf ${target}.tar.gz ${target}`, outRoot)
	run(`du -sh ${target} ${target}.tar.gz`, outRoot)
}
console.info(`\n[package] done: ${join(outRoot, target)}`)

// Native packages (sharp) list a prebuilt variant per platform/libc as
// optional deps; only the one matching this build target is shipped.
function isForeignPlatformVariant(name) {
	if (name.endsWith('-wasm32')) return true
	if (!/-(linuxmusl|linux|darwin|win32)-(x64|arm64|ia32)$/.test(name)) return false
	return !name.includes(`-${process.platform}-${process.arch}`)
}
