import test, { expect } from '@playwright/test'
import { createNewUser, deleteAccount } from 'fixtures/auth'
import { makeUrl } from 'tests/utils'

test.describe('Calendar List', () => {
	test.beforeEach(async ({ page }) => {
		await createNewUser(page)
	})

	test('create calendars from different templates', async ({ page }) => {
		await page.goto(makeUrl('/calendar'))

		async function createAndOpenCalendar(calendarName: string, templateName: string) {
			await page.getByLabel('Create new calendar').click()
			await page.getByLabel('Name').fill(calendarName)
			await page.getByLabel('Template to copy').click()
			await page.getByRole('option', { name: templateName }).click()
			await page.getByText('Create', { exact: true }).click()

			// await page.getByLabel
			await page.getByLabel(`Load calendar "${calendarName}"`).click()
			await page.waitForURL(/\/calendar\/[a-f0-9-]+/)
		}

		await createAndOpenCalendar('Earth Calendar', 'Gregorian Calendar (Earth)')
		await expect(page.getByText('Earth Calendar')).toBeVisible()
		await expect(page.getByText('00:00 January 01, 2026').first()).toBeVisible()
		await page.getByLabel('Home navigation menu').click()
		await page.getByLabel('Navigate to calendars').click()

		await createAndOpenCalendar('Martian Calendar', 'Darian Calendar (Martian)')
		await expect(page.getByText('Martian Calendar')).toBeVisible()
		await expect(page.getByText('00:00 01 Sagittarius 0000').first()).toBeVisible()
		await page.getByLabel('Home navigation menu').click()
		await page.getByLabel('Navigate to calendars').click()

		await createAndOpenCalendar('Golarion Calendar', 'Golarion Calendar (Pathfinder)')
		await expect(page.getByText('Golarion Calendar')).toBeVisible()
		await expect(page.getByText('00:00 Abadius 01, 4726').first()).toBeVisible()
		await page.getByLabel('Home navigation menu').click()
		await page.getByLabel('Navigate to calendars').click()

		await createAndOpenCalendar('Quadrum Calendar', 'Quadrum Calendar (RimWorld)')
		await expect(page.getByText('Quadrum Calendar')).toBeVisible()
		await expect(page.getByText('00:00 Aprimay 01, 5500').first()).toBeVisible()
		await page.getByLabel('Home navigation menu').click()
		await page.getByLabel('Navigate to calendars').click()

		await createAndOpenCalendar('Exether Calendar', 'Exether Calendar')
		await expect(page.getByText('Exether Calendar')).toBeVisible()
		await expect(page.getByText('00:00 Frostmoot 01, 1178').first()).toBeVisible()
		await page.getByLabel('Home navigation menu').click()
		await page.getByLabel('Navigate to calendars').click()
	})

	test.afterEach(async ({ page }) => {
		await deleteAccount(page)
	})
})
