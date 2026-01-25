import { defineConfig } from 'vitest/config'

export default defineConfig({
	base: '/',
	resolve: {
		alias: [
			{ find: '@src', replacement: '/src' },
			{ find: /^@prisma\/client$/, replacement: '/prisma/client/client.ts' },
		],
	},
	test: {
		globals: true,
		environment: 'jsdom',
		setupFiles: 'src/setupTests.ts',
		testTimeout: 15000,
	},
})
