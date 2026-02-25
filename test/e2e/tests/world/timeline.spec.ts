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

		// Open event
		await page.getByTestId('TimelineMarker').click()
		await page.getByTestId('TimelineMarker').click()
		await expect(textbox).toHaveText('Hello world')

		// Edit event
		await textbox.pressSequentially(' - extra text', { delay: 100 })
		await expect(textbox).toHaveText('Hello world - extra text')

		// Close event
		await page.keyboard.press('Escape')
		await expect(textbox).not.toBeVisible()

		// Reopen event (should have the updated text)
		await page.getByTestId('TimelineMarker').click()
		await page.getByTestId('TimelineMarker').click()
		await expect(textbox).toHaveText('Hello world - extra text')

		// Click outside to close
		await page
			.getByTestId('modal-backdrop')
			.filter({ has: textbox })
			.click({ position: { x: 0, y: 0 } })
		await expect(textbox).not.toBeVisible()

		// Delete event
		await page.getByTestId('TimelineMarker').click({ button: 'right' })
		await page.getByRole('menuitem', { name: 'Delete this event' }).click()
		await page.getByRole('button', { name: 'Confirm' }).click()

		await expect(page.getByTestId('TimelineMarker')).not.toBeVisible()
	})

	test('navigation', async ({ page }) => {
		await navigateToTimeline(page, 'createWorld')

		await expect(page.getByText('January 01, 2026', { exact: true })).toBeVisible()
		// await page.getByLabel('Timeline tracks container').click()

		await page.getByLabel('Zoom out timeline').click()
		await page.waitForTimeout(500)

		// Navigate right with shortcut
		for (let i = 0; i < 4; i++) {
			await page.keyboard.press('l')
			await page.waitForTimeout(50)
		}
		await expect(page.getByText('January 02, 2026', { exact: true })).toBeVisible()

		// Navigate left with shortcut
		for (let i = 0; i < 11; i++) {
			await page.keyboard.press('j')
			await page.waitForTimeout(50)
		}
		await expect(page.getByText('December 31, 2025', { exact: true })).toBeVisible()

		for (let i = 0; i < 10; i++) {
			await page.keyboard.press('j')
			await page.waitForTimeout(50)
		}

		await page.getByLabel('Zoom in timeline').click()
		await expect(async () => {
			await expect(page.getByText('21:00', { exact: true })).toBeVisible()
			await expect(page.getByText('22:00', { exact: true })).toBeVisible()
			await expect(page.getByText('21:25 December 26, 2025', { exact: true })).toBeVisible()
		}).toPass()
	})

	test.afterEach(async ({ page }) => {
		await deleteAccount(page)
	})
})
