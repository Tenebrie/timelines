import test, { expect } from '@playwright/test'
import { createNewUser, deleteAccount } from 'fixtures/auth'
import { navigateToTimeline } from 'fixtures/world'

test.describe('Timeline', () => {
	test.beforeEach(async ({ page }) => {
		await createNewUser(page)
	})

	test('create event -> edit event -> delete event flow', async ({ page }) => {
		await navigateToTimeline(page, 'createWorld')

		// Open the create world drawer
		await page.getByTestId('ResizeableDrawerPulldown').nth(1).click()
		await page.waitForTimeout(1000)

		// Create event
		const textbox = page.getByTestId('RichTextEditor').getByRole('textbox')
		await textbox.pressSequentially('Hello world', { delay: 100 })
		await expect(page.getByTestId('TimelineMarkerChain')).toBeVisible()
		await expect(page.getByTestId('TimelineMarkerChain')).toHaveText('Hello world')

		// Edit event
		await textbox.pressSequentially(' - extra text', { delay: 100 })
		await expect(page.getByTestId('TimelineMarkerChain')).toHaveText('Hello world - extra text')

		// Delete event
		await textbox.clear()
		await expect(page.getByTestId('TimelineMarkerChain')).not.toBeVisible()
	})

	test.afterEach(async ({ page }) => {
		await deleteAccount(page)
	})
})
