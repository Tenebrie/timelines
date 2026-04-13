import tanstackRouter from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig } from 'vitest/config'

const tanstackTempDir = process.env.TSR_TMP_DIR || path.resolve('node_modules/.tanstack')

export default defineConfig({
	base: '/',
	define: {
		__APP_VERSION__: JSON.stringify(process.env.VERSION ?? 'Dev'),
		__BUILD_TIME__: JSON.stringify(new Date().toISOString()),
	},
	plugins: [tanstackRouter({ autoCodeSplitting: true, tmpDir: tanstackTempDir }), react()],
	resolve: {
		tsconfigPaths: true,
		alias: {
			'@api': '/src/api',
			'@': '/src',
		},
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
