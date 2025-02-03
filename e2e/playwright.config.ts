import { defineConfig } from '@playwright/test'

export default defineConfig({
	testDir: './tests',
	outputDir: './test-report/artifacts',
	reporter: [['list'], ['html', { outputFolder: './test-report/html', open: 'never' }]],
	retries: 2,
	use: {
		// You can add browser or context options here.
		headless: true,
		screenshot: 'only-on-failure',
		// More options if needed.
	},
})
