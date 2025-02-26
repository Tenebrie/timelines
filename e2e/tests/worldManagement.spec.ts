import { expect, test } from '@playwright/test'
import { createNewUser, deleteAccount } from 'fixtures/auth'

import { makeUrl } from './utils'

test.describe('World management', () => {
	test.beforeEach(async ({ page }) => {
		await createNewUser(page)
	})

	test('create world -> delete world flow', async ({ page }) => {
		await page.goto(makeUrl('/'))

		await expect(page.getByText('Nothing has been created yet!')).toBeVisible()
		await expect(page.getByText('Create new world...')).toBeVisible()

		// Create world
		await page.getByText('Create new world...').click()
		await expect(page.getByText('Create world')).toBeVisible()

		await page.getByLabel('Name').fill('My First World')
		await page.getByLabel('Description').fill('World description')
		await page.getByText('Confirm').click()

		await page.waitForURL(/\/world\/[a-f0-9-]+\/timeline/)
		await expect(page.getByText('My First World')).toBeVisible()
		await expect(page.getByText('World description')).toBeVisible()

		// Navigate to settings
		await page.getByText('Home').click()
		await page.getByTestId('EditIcon').click()
		await page.waitForURL(/\/world\/[a-f0-9-]+\/settings/)
		await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible()

		// Delete world
		await page.getByText('Home').click()
		await page.getByTestId('DeleteIcon').click()
		await expect(page.getByText('Delete world', { exact: true })).toBeVisible()

		await page.getByText('Confirm').click()
		await expect(page.getByText('Nothing has been created yet!')).toBeVisible()
	})

	test.afterEach(async ({ page }) => {
		await deleteAccount(page)
	})
})
