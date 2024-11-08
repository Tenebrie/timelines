import react from '@vitejs/plugin-react'
import viteTsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

export default defineConfig({
	base: '/',
	plugins: [react(), viteTsconfigPaths()],
	test: {
		globals: true,
		environment: 'jsdom',
		setupFiles: 'src/setupTests.ts',
		testTimeout: 15000,
	},
	build: {
		outDir: 'build',
		rollupOptions: {
			output: {
				manualChunks: () => 'everything',
			},
		},
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
