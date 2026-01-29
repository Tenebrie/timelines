import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
	testDir: './tests',
	outputDir: './test-report/artifacts',
	reporter: [['list'], ['html', { outputFolder: './test-report/html', open: 'never' }]],
	retries: 2,
	fullyParallel: true,
	workers: '50%',
	projects: [
		/* Test against desktop browsers */
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'] },
		},
		{
			name: 'firefox',
			use: { ...devices['Desktop Firefox'] },
		},
		{
			name: 'webkit',
			use: { ...devices['Desktop Safari'] },
		},
	],
	use: {
		// You can add browser or context options here.
		headless: true,
		screenshot: 'only-on-failure',
		// More options if needed.
	},
})
