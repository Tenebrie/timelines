import { defineConfig } from 'vitest/config'

export default defineConfig({
	base: '/',
	resolve: {
		alias: [{ find: '@src', replacement: '/src' }],
	},
	test: {
		globals: true,
		environment: 'node',
		testTimeout: 15000,
		setupFiles: 'src/test-utils/setupTests.ts',
		coverage: {
			provider: 'v8',
			reporter: 'text',
		},
	},
})
