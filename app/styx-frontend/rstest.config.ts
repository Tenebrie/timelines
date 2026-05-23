import { pluginReact } from '@rsbuild/plugin-react'
import { defineConfig } from '@rstest/core'

export default defineConfig({
	plugins: [pluginReact()],
	globals: true,
	testEnvironment: 'jsdom',
	setupFiles: ['src/test-utils/setupTests.ts'],
	testTimeout: 15000,
	coverage: {
		provider: 'v8',
		reporters: ['text'],
	},
})
