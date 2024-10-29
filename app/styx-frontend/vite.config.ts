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
				manualChunks(id) {
					const extractedDeps = [
						'styled-components',
						'react-dom',
						'redux',
						'@mui/system',
						'@mui/material/A',
						'@mui/material/B',
						'@mui/material/C',
						'@mui/material/E',
						'@mui/material/J',
						'@mui/material/K',
						'@mui/material/Q',
						'@mui/material/S',
						'@mui/material/T',
						'@mui/material/V',
						'@mui/material/W',
						'@mui/material/X',
						'@mui/material/Y',
						'@mui/material',
						'@emotion',
						'rollbar',
						'zod',
						'react',
					]
					for (let i = 0; i < extractedDeps.length; i++) {
						if (id.includes(extractedDeps[i])) {
							return extractedDeps[i].replace('@', '').replace('/', '-')
						}
					}
					if (id.includes('node_modules')) {
						return 'vendor'
					} else if (id.includes('src/app/features/world')) {
						return 'world'
					}
					return undefined
				},
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
