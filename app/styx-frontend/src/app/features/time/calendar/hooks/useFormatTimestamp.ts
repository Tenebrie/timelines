import { Calendar, CalendarDraft } from '@api/types/calendarTypes'
import { WorldCalendar } from '@api/types/worldTypes'

import { useFormatTimestampUnits } from './useFormatTimestampUnits'

export function useFormatTimestamp({
	calendar,
}: {
	calendar?: Calendar | CalendarDraft | WorldCalendar | null
}) {
	return useFormatTimestampUnits({
		units: calendar?.units ?? [],
		dateFormatString: calendar?.dateFormat ?? '',
		originTime: calendar ? Number(calendar.originTime) : 0,
	})
}
