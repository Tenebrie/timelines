import { mkdirSync } from 'node:fs'
import path, { join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

import esbuild from 'esbuild'

import { BUNDLE_STUBS, RUNTIME_SHIMS } from '../src/substitutions.mjs'

/**
 * Bundles Rhea and Calliope's built output into two self-contained ESM files,
 * applying the same substitutions the dev-mode ESM loader hooks apply at
 * runtime (`redis` → shim, `@prisma/adapter-pg` → PGlite shim, generated
 * Prisma client → transaction-limits wrapper). Only genuinely native/WASM
 * packages stay external; the packaged app ships those few node_modules
 * instead of the services' full dependency trees.
 */
const desktopDir = join(fileURLToPath(new URL('.', import.meta.url)), '..')
const repoRoot = join(desktopDir, '..', '..')
const outDir = join(desktopDir, 'dist/bundles')

export const EXTERNALS = ['bcrypt', 'sharp', '@electric-sql/pglite', 'pglite-prisma-adapter', 'electron']

const prismaClientWrapPlugin = {
	name: 'prisma-client-wrap',
	setup(build) {
		// the wrapper's own `?nkd-original` import resolves to the real client
		build.onResolve({ filter: /\?nkd-original$/ }, (args) => ({
			path: path.resolve(path.dirname(args.importer), args.path.replace(/\?nkd-original$/, '')),
		}))
		// every other import of the generated client goes through the wrapper
		build.onResolve({ filter: /prisma[/\\]client[/\\]client\.js$/ }, () => ({
			path: join(desktopDir, 'src', 'prisma-client-wrap.mjs'),
		}))
	},
}

const shared = {
	bundle: true,
	platform: 'node',
	format: 'esm',
	target: 'node20',
	minify: true,
	keepNames: true,
	logLevel: 'warning',
	external: EXTERNALS,
	alias: Object.fromEntries(
		Object.entries({ ...RUNTIME_SHIMS, ...BUNDLE_STUBS }).map(([specifier, shim]) => [
			specifier,
			join(desktopDir, 'src', shim),
		]),
	),
	banner: {
		js: [
			"import { createRequire as __nkdCreateRequire } from 'node:module';",
			"import { fileURLToPath as __nkdFileURLToPath } from 'node:url';",
			"import __nkdPath from 'node:path';",
			'const require = __nkdCreateRequire(import.meta.url);',
			'const __filename = __nkdFileURLToPath(import.meta.url);',
			'const __dirname = __nkdPath.dirname(__filename);',
		].join('\n'),
	},
}

export async function bundleBackends() {
	mkdirSync(outDir, { recursive: true })
	await esbuild.build({
		...shared,
		entryPoints: [join(repoRoot, 'app', 'rhea-backend', 'dist', 'src', 'index.js')],
		outfile: join(outDir, 'rhea.mjs'),
		plugins: [prismaClientWrapPlugin],
	})
	await esbuild.build({
		...shared,
		entryPoints: [join(repoRoot, 'app', 'calliope-websockets', 'dist', 'index.js')],
		outfile: join(outDir, 'calliope.mjs'),
	})
	console.info(`[bundle] backends bundled to ${outDir}`)
	return outDir
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
	await bundleBackends()
}
