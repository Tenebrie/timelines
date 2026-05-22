import tanstackRouter from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import type { Plugin } from 'vite'
import { defineConfig } from 'vitest/config'

const tanstackTempDir = process.env.TSR_TMP_DIR || path.resolve('node_modules/.tanstack')

export default defineConfig({
	base: '/',
	define: {
		__APP_VERSION__: JSON.stringify(process.env.VERSION ?? 'Dev'),
		__BUILD_TIME__: JSON.stringify(new Date().toISOString()),
	},
	plugins: [
		tanstackRouter({ autoCodeSplitting: true, tmpDir: tanstackTempDir }),
		react(),
		watchNeverkinLibraries(),
	],
	resolve: {
		tsconfigPaths: true,
		preserveSymlinks: true,
		alias: {
			'@api': '/src/api',
			'@': '/src',
		},
	},
	optimizeDeps: {
		exclude: getNeverkinPackages(),
	},
	test: {
		globals: true,
		environment: 'jsdom',
		setupFiles: 'src/test-utils/setupTests.ts',
		testTimeout: 15000,
		coverage: {
			provider: 'v8',
			reporter: 'text',
		},
	},
	build: {
		outDir: 'build',
	},
	preview: {
		port: 8080,
		host: '0.0.0.0',
	},
	server: {
		port: 8080,
		host: '0.0.0.0',
		allowedHosts: ['styx'],
		hmr: {
			clientPort: 8080,
		},
	},
})

function watchNeverkinLibraries(): Plugin {
	const libraryDir = path.resolve('../../library')
	const distMappings = !fs.existsSync(libraryDir)
		? []
		: fs
				.readdirSync(libraryDir, { withFileTypes: true })
				.filter(
					(entry) => entry.isDirectory() && fs.existsSync(path.join(libraryDir, entry.name, 'package.json')),
				)
				.map((entry) => {
					const pkg = JSON.parse(
						fs.readFileSync(path.join(libraryDir, entry.name, 'package.json'), 'utf8'),
					) as {
						name: string
					}
					return {
						realDist: path.join(libraryDir, entry.name, 'dist'),
						symlinkDist: path.resolve('node_modules', pkg.name, 'dist'),
					}
				})
				.filter((mapping) => fs.existsSync(mapping.realDist))
	return {
		name: 'watch-neverkin-libraries',
		configureServer(server) {
			for (const mapping of distMappings) server.watcher.add(mapping.realDist)
		},
		handleHotUpdate(ctx) {
			const mapping = distMappings.find((entry) => ctx.file.startsWith(entry.realDist + path.sep))
			if (!mapping) return
			// tsc emits .d.ts and .js.map alongside the .js; those aren't modules, so never act on them
			if (!ctx.file.endsWith('.js')) return []
			const symlinkFile = mapping.symlinkDist + ctx.file.slice(mapping.realDist.length)
			const modules = ctx.server.moduleGraph.getModulesByFile(symlinkFile)
			return modules && modules.size > 0 ? [...modules] : []
		},
	}
}

// Discover library packages
function getNeverkinPackages(): string[] {
	const libraryDir = path.resolve('../../library')
	if (!fs.existsSync(libraryDir)) return []
	return fs
		.readdirSync(libraryDir, { withFileTypes: true })
		.filter(
			(entry) => entry.isDirectory() && fs.existsSync(path.join(libraryDir, entry.name, 'package.json')),
		)
		.map((entry) => {
			const pkg = JSON.parse(fs.readFileSync(path.join(libraryDir, entry.name, 'package.json'), 'utf8')) as {
				name: string
			}
			return pkg.name
		})
}
