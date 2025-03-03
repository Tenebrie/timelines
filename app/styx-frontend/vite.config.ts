import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react'
import viteTsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

export default defineConfig({
	base: '/',
	plugins: [TanStackRouterVite({ autoCodeSplitting: true }), react(), viteTsconfigPaths()],
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
	},
	server: {
		port: 8080,
		watch: {
			usePolling: true,
		},
		hmr: {
			port: 8080,
			clientPort: 8080,
		},
	},
})
