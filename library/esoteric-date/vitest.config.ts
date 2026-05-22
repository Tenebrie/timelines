import path from 'path'
import { defineConfig } from 'vitest/config'

// Mirrors Styx's path aliases so the extracted date code/tests resolve without import edits,
// provided their dependencies are placed under src/api (see README.md).
export default defineConfig({
	resolve: {
		alias: {
			'@api': path.resolve('src/api'),
			'@': path.resolve('src'),
		},
	},
	test: {
		globals: true,
		environment: 'node',
	},
})
