import { expect, test } from '@playwright/test'

import { makeUrl } from '../fixtures/utils'

test.describe('Guest user', () => {
	test('user is redirected to login page', async ({ page }) => {
		await page.goto(makeUrl('/'))

		await expect(page).toHaveTitle(/Timelines/)
		await expect(page.getByText('Sign in to Timelines')).toBeVisible()
	})
})
