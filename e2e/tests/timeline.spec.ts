import test, { expect } from '@playwright/test'
import { createNewUser, deleteAccount } from 'fixtures/auth'
import { navigateToTimeline } from 'fixtures/world'

test.describe('Timeline', () => {
	test.beforeEach(async ({ page }) => {
		await createNewUser(page)
	})

	test('create event -> edit event -> delete event flow', async ({ page }) => {
		await navigateToTimeline(page, 'createWorld')

		// Open the create event menu
		await page.getByTestId('CreateEntityButton').click()
		await page.waitForTimeout(100)

		// Create event
		const textbox = page.getByTestId('RichTextEditor').getByRole('textbox')
		await textbox.pressSequentially('Hello world', { delay: 100 })
		await expect(page.getByTestId('TimelineMarkerChain')).toBeVisible()
		await expect(page.getByTestId('TimelineMarkerChain')).toHaveText('Hello world')

		// Edit event
		await textbox.pressSequentially(' - extra text', { delay: 100 })
		await expect(page.getByTestId('TimelineMarkerChain')).toHaveText('Hello world - extra text')

		// Delete event
		await page.waitForTimeout(100)
		await textbox.clear()
		await expect(page.getByTestId('TimelineMarkerChain')).not.toBeVisible()
	})

	test.afterEach(async ({ page }) => {
		await deleteAccount(page)
	})
})
