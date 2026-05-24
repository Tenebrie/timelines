import { createNewUser, deleteAccount } from '@fixtures/auth'
import { createCalendar, navigateToCalendarEditor } from '@fixtures/calendar'
import test, { expect, Page } from '@playwright/test'

// The unit editor autosaves with a 300ms debounce that is NOT flushed when the
// editor unmounts, so we let it settle before selecting a different unit.
const SAVE_DEBOUNCE_MS = 500

async function createUnit(page: Page, name: string) {
	await page.getByRole('button', { name: 'Add time unit' }).click()
	await page.getByPlaceholder('Unit name').fill(name)
	const createButton = page.getByRole('button', { name: 'Create', exact: true })
	await expect(createButton).toBeEnabled()
	await createButton.click()
	await expect(
		page.getByTestId('CalendarUnitListItem').filter({ has: page.getByText(name, { exact: true }) }),
	).toBeVisible()
}

async function selectUnit(page: Page, name: string) {
	await page
		.getByTestId('CalendarUnitListItem')
		.filter({ has: page.getByText(name, { exact: true }) })
		.getByText(name, { exact: true })
		.click()
	await expect(page.getByTestId('CalendarUnitTitle')).toContainText(name)
}

// `mode` is the dropdown's primary label, e.g. "Numeric" or "Numeric (One Indexed)".
async function setUnitFormatMode(page: Page, mode: string) {
	await page.getByLabel('Unit mode').click()
	// Each option's accessible name includes its description, so match the exact
	// primary text to keep "Numeric" from also matching "Numeric (One Indexed)".
	await page
		.getByRole('option')
		.filter({ has: page.getByText(mode, { exact: true }) })
		.click()
}

// Shorthand and mode share a single debounced save in CalendarUnitFormat, so we
// let the shorthand land before changing the mode — otherwise the trailing
// debounce fires with only the mode and drops the shorthand.
async function setUnitFormat(page: Page, shorthand: string, mode: string) {
	await page.getByLabel('Shorthand').fill(shorthand)
	await page.waitForTimeout(SAVE_DEBOUNCE_MS)
	await setUnitFormatMode(page, mode)
	await page.waitForTimeout(SAVE_DEBOUNCE_MS)
}

// Adds a child relation in the (already expanded) Structure section.
async function addChildUnit(page: Page, childName: string, repeats: number) {
	const picker = page.getByPlaceholder('Select unit')
	await picker.click()
	await picker.fill(childName)
	await page.getByRole('option', { name: childName, exact: true }).click()
	// The header has its own preview-timestamp spinbutton, so scope to the unit
	// editor where (before adding) the repeats field is the only spinbutton.
	await page.getByTestId('CalendarUnitEditor').getByRole('spinbutton').fill(String(repeats))
	await page.getByRole('button', { name: 'Add', exact: true }).click()
}

test.describe('Calendar Editor View', () => {
	test.beforeEach(async ({ page }) => {
		await createNewUser(page)
	})

	test('typing in a unit display name and pressing Enter does not delete units', async ({ page }) => {
		// The RimWorld template comes with five units: Minute, Hour, Day, Quadrum, Year.
		const calendar = await createCalendar(page, { name: 'Regression Calendar', templateId: 'rimworld' })
		await navigateToCalendarEditor(page, calendar)

		// --- Open the Time Units tab and confirm all five units are listed ---
		await page.getByRole('tab', { name: 'Time Units' }).click()
		await expect(page.getByTestId('CalendarUnitListItem')).toHaveCount(5)

		// --- Select a unit to open its editor ---
		await page
			.getByTestId('CalendarUnitListItem')
			.filter({ has: page.getByText('Quadrum', { exact: true }) })
			.click()

		// The "Display names" section is collapsed by default - expand it.
		await page.getByText('Display names', { exact: true }).click()

		// --- Type into the unit's display name field and press Enter ---
		const displayNameField = page.getByLabel('Display Name', { exact: true })
		await displayNameField.click()
		await displayNameField.fill('Quadrumister')
		await displayNameField.press('Enter')

		await expect(page.getByTestId('CalendarUnitListItem')).toHaveCount(5)

		await page.reload()
		await page.getByRole('tab', { name: 'Time Units' }).click()
		await expect(page.getByTestId('CalendarUnitListItem')).toHaveCount(5)
	})

	test('pressing Enter confirms an open delete popover and removes the unit', async ({ page }) => {
		const calendar = await createCalendar(page, { name: 'Delete Calendar', templateId: 'rimworld' })
		await navigateToCalendarEditor(page, calendar)

		await page.getByRole('tab', { name: 'Time Units' }).click()
		await expect(page.getByTestId('CalendarUnitListItem')).toHaveCount(5)

		// --- Open the delete confirmation popover for the Quadrum unit ---
		const quadrumItem = page
			.getByTestId('CalendarUnitListItem')
			.filter({ has: page.getByText('Quadrum', { exact: true }) })
		await quadrumItem.getByRole('button', { name: 'Delete unit', exact: true }).click()
		await expect(page.getByText('Are you sure you want to delete')).toBeVisible()

		// --- With the popover open, Enter must confirm the deletion ---
		await page.keyboard.press('Enter')

		await expect(page.getByTestId('CalendarUnitListItem')).toHaveCount(4)
		await expect(
			page.getByTestId('CalendarUnitListItem').filter({ has: page.getByText('Quadrum', { exact: true }) }),
		).toHaveCount(0)

		// --- Deletion persisted server-side ---
		await page.reload()
		await page.getByRole('tab', { name: 'Time Units' }).click()
		await expect(page.getByTestId('CalendarUnitListItem')).toHaveCount(4)
	})

	test('builds a Gregorian-style calendar from scratch that parses correctly', async ({ page }) => {
		// Building five units with relations through the UI is a long flow.
		test.setTimeout(120_000)

		// Start from a completely empty calendar (no template -> zero units).
		const calendar = await createCalendar(page, { name: 'From Scratch' })
		await navigateToCalendarEditor(page, calendar)
		await page.getByRole('tab', { name: 'Time Units' }).click()

		// --- Create the five building blocks ---
		for (const name of ['Minute', 'Hour', 'Day', 'Month', 'Year']) {
			await createUnit(page, name)
		}
		await expect(page.getByTestId('CalendarUnitListItem')).toHaveCount(5)

		// Expand the editor sections once - the expanded state is global, so it
		// persists as we move between units.
		await selectUnit(page, 'Minute')
		await page.getByText('Display names', { exact: true }).click()
		await page.getByText('Formatting', { exact: true }).click()
		await page.getByText('Structure', { exact: true }).click()

		// --- Minute: base unit ---
		await page.getByLabel('Display Name (Plural)', { exact: true }).fill('minutes')
		await setUnitFormat(page, 'm', 'Numeric')

		// --- Hour: contains 60 minutes ---
		await selectUnit(page, 'Hour')
		await page.getByLabel('Display Name (Plural)', { exact: true }).fill('hours')
		await setUnitFormat(page, 'h', 'Numeric')
		await addChildUnit(page, 'Minute', 60)

		// --- Day: contains 24 hours ---
		await selectUnit(page, 'Day')
		await page.getByLabel('Display Name (Plural)', { exact: true }).fill('days')
		await setUnitFormat(page, 'd', 'Numeric (One Indexed)')
		await addChildUnit(page, 'Hour', 24)

		// --- Month: contains 30 days ---
		await selectUnit(page, 'Month')
		await page.getByLabel('Display Name (Plural)', { exact: true }).fill('months')
		await setUnitFormat(page, 'M', 'Numeric (One Indexed)')
		await addChildUnit(page, 'Day', 30)

		// --- Year: root unit, contains 12 months ---
		await selectUnit(page, 'Year')
		await setUnitFormat(page, 'Y', 'Numeric (One Indexed)')
		await addChildUnit(page, 'Month', 12)

		// --- The structure reads sensibly in the sidebar ---
		await expect(page.getByText('60 minutes')).toBeVisible()
		await expect(page.getByText('24 hours')).toBeVisible()
		await expect(page.getByText('30 days')).toBeVisible()
		await expect(page.getByText('12 months')).toBeVisible()

		// --- And a timestamp parses/formats correctly ---
		// At timestamp 0: year 1 (one-indexed), month 01, day 01, 00:00.
		await page.getByLabel('Time Format').fill('Y-MM-dd hh:mm')
		await expect(page.getByText('1-01-01 00:00')).toBeVisible()
	})

	test.afterEach(async ({ page }) => {
		await deleteAccount(page)
	})
})
