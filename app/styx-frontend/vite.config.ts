import react from '@vitejs/plugin-react'
import viteTsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

export default defineConfig({
	// depending on your application, base can also be "/"
	base: '',
	plugins: [react(), viteTsconfigPaths()],
	test: {
		globals: true,
		environment: 'jsdom',
		setupFiles: 'src/setupTests.ts',
	},
	build: {
		outDir: 'build',
	},
	server: {
		// this sets a default port to 3000
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
