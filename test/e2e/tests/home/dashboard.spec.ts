import test, { expect } from '@playwright/test'
import { createNewUser, deleteAccount } from 'fixtures/auth'
import { navigateToDashboard } from 'fixtures/world'

test.describe('Dashboard', () => {
	test.beforeEach(async ({ page }) => {
		await createNewUser(page)
	})

	test('empty states and navigation', async ({ page }) => {
		await navigateToDashboard(page)

		const headerMessage = `Welcome back! Here's an overview of your creative universe.`

		await expect(page.getByText(headerMessage)).toBeVisible()
		await expect(page.getByLabel('Worlds card')).toHaveText('0WorldsOwned0Contributing0')
		await expect(page.getByLabel('Calendars card')).toHaveText('0CalendarsTotal0')

		await page.getByLabel('Worlds card').click()
		await expect(page.getByText('No worlds yet. Click the + button to create one!')).toBeVisible()

		await page.goBack()
		await expect(page.getByText(headerMessage)).toBeVisible()

		await page.getByLabel('Calendars card').click()
		await expect(page.getByText('No calendars yet. Click the + button to create one!')).toBeVisible()

		await page.getByLabel('Home navigation menu').click()
		await page.getByLabel('Navigate to worlds').click()
		await expect(page.getByText('No worlds yet. Click the + button to create one!')).toBeVisible()

		await page.getByLabel('Home navigation menu').click()
		await page.getByLabel('Navigate to calendars').click()
		await expect(page.getByText('No calendars yet. Click the + button to create one!')).toBeVisible()

		await page.getByLabel('Navigate to home').click()
		await expect(page.getByText(headerMessage)).toBeVisible()
	})

	test.afterEach(async ({ page }) => {
		await deleteAccount(page)
	})
})
