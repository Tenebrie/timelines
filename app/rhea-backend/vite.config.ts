import { defineConfig } from 'vitest/config'

export default defineConfig({
	base: '/',
	resolve: {
		alias: {
			'@src': '/src',
		},
	},
	test: {
		globals: true,
		environment: 'jsdom',
		setupFiles: 'src/setupTests.ts',
		testTimeout: 15000,
	},
})
