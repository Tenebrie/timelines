import { defineConfig } from 'vitest/config'

export default defineConfig({
	base: '/',
	resolve: {
		alias: [{ find: '@src', replacement: '/src' }],
		dedupe: [
			'yjs',
			'y-protocols',
			'@tiptap/core',
			'@tiptap/pm',
			'@tiptap/html',
			'@tiptap/y-tiptap',
			'prosemirror-model',
			'prosemirror-state',
			'prosemirror-transform',
			'prosemirror-view',
		],
	},
	test: {
		globals: true,
		environment: 'node',
		testTimeout: 15000,
	},
})
