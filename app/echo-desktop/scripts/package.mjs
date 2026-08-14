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
 * Produces a self-contained, redistributable desktop build:
 *
 *   dist/package/echo-desktop-<platform>-<arch>/   (runnable folder)
 *   dist/package/echo-desktop-<platform>-<arch>.zip|.tar.gz
 *
 * The backends ship as esbuild bundles (shims compiled in), so the package
 * carries no service node_modules — only the Electron runtime, the SPA build,
 * the migrations, and the handful of native/WASM packages that cannot be
 * bundled. Native modules are taken from the local install, so stage each
 * target OS on that OS.
 *
 * Run `npm run build:upstream` first; this script only stages built outputs.
 */
const desktopDir = join(fileURLToPath(new URL('.', import.meta.url)), '..')
const repoRoot = join(desktopDir, '..', '..')
const target = `echo-desktop-${process.platform}-${process.arch}`
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
 * Copies `rootDeps` and their full runtime dependency closure (including
 * present optional deps, e.g. the platform's @img/sharp-* prebuilds) from
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

// 4. Rhea runtime files read from disk (spec, assets) + migrations
const rheaStage = join(resources, 'rhea-backend')
copy(join(rheaSource, 'dist', 'apiSpec.json'), join(rheaStage, 'dist', 'apiSpec.json'))
if (existsSync(join(rheaSource, 'dist', 'assets'))) {
	copy(join(rheaSource, 'dist', 'assets'), join(rheaStage, 'dist', 'assets'))
}
copy(join(rheaSource, 'prisma', 'migrations'), join(rheaStage, 'prisma', 'migrations'))

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
		'— nothing leaves your machine.',
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
	// bsdtar ships with Windows 10+; -a picks the zip format from the extension
	run(`tar -a -c -f ${target}.zip ${target}`, outRoot)
} else {
	try {
		run(`zip -ryq ${target}.zip ${target}`, outRoot)
	} catch {
		console.warn('[package] zip unavailable, creating tar.gz instead')
		run(`tar -czf ${target}.tar.gz ${target}`, outRoot)
	}
	run(`du -sh ${target} ${target}.zip ${target}.tar.gz 2>/dev/null || true`, outRoot)
}
console.info(`\n[package] done: ${join(outRoot, target)}`)

// Native packages (sharp) list a prebuilt variant per platform/libc as
// optional deps; only the one matching this build target is shipped.
function isForeignPlatformVariant(name) {
	if (name.endsWith('-wasm32')) return true
	if (!/-(linuxmusl|linux|darwin|win32)-(x64|arm64|ia32)$/.test(name)) return false
	return !name.includes(`-${process.platform}-${process.arch}`)
}
