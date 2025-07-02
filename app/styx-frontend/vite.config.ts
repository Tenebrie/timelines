import tanstackRouter from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import viteTsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

const tanstackTempDir = process.env.TSR_TMP_DIR || path.resolve('node_modules/.tanstack')

export default defineConfig({
	base: '/',
	plugins: [
		tanstackRouter({ autoCodeSplitting: true, tmpDir: tanstackTempDir }),
		react(),
		viteTsconfigPaths(),
	],
	resolve: {
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
	},
	build: {
		outDir: 'build',
	},
	preview: {
		port: 8080,
		host: true,
		allowedHosts: true,
	},
	server: {
		port: 8080,
		allowedHosts: true,
		watch: {
			usePolling: true,
		},
		hmr: {
			port: 8080,
			clientPort: 8080,
		},
	},
})
