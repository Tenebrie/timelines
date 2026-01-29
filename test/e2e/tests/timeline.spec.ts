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
		await page.getByTestId('CreateEventModalConfirmButton').click()
		await page.waitForTimeout(500)
		await expect(page.getByTestId('TimelineMarker')).toBeVisible()
		// TODO: Update assertions for the new design (use world state?)
		// await expect(page.getByTestId('TimelineMarker')).toHaveText('Hello world')

		// Edit event
		await textbox.pressSequentially(' - extra text', { delay: 100 })
		// await expect(page.getByTestId('TimelineMarker')).toHaveText('Hello world - extra text')
	})

	test.afterEach(async ({ page }) => {
		await deleteAccount(page)
	})
})
