import { expect, Page } from '@playwright/test'
import { makeUrl } from '@tests/utils'

import type { CalendarTemplateId } from '../../../app/styx-frontend/src/api/types/worldTypes'

export const createCalendar = async (
	page: Page,
	calendar?: { name?: string; templateId?: CalendarTemplateId },
) => {
	const calendarData = {
		name: 'My Calendar',
		...calendar,
	}
	const rawResponse = await page.request.post(makeUrl('/api/calendars'), {
		data: calendarData,
	})
	expect(rawResponse.ok()).toBeTruthy()
	const response = (await rawResponse.json()) as { id: string }
	return {
		...calendarData,
		id: response.id,
	}
}

export const navigateToCalendarEditor = async (
	page: Page,
	calendarData: 'createCalendar' | Awaited<ReturnType<typeof createCalendar>>,
) => {
	if (calendarData === 'createCalendar') {
		calendarData = await createCalendar(page)
	}

	await page.goto(makeUrl(`/calendar/${calendarData.id}`))
	return { calendar: calendarData }
}
