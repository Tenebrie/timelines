import { defineConfig, devices } from '@playwright/test'

/**
 * CI-specific Playwright configuration.
 * Extends the base config with all browsers enabled for comprehensive testing.
 * Used with sharding in GitHub Actions for parallel execution.
 */
export default defineConfig({
	testDir: './tests',
	outputDir: './test-report/artifacts',
	reporter: [['list'], ['html', { outputFolder: './test-report/html', open: 'never' }]],
	retries: 2,
	fullyParallel: true,
	timeout: 60000,
	expect: {
		timeout: 10000,
	},
	projects: [
		/* Test against all desktop browsers in CI */
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
		headless: true,
		screenshot: 'only-on-failure',
	},
})
