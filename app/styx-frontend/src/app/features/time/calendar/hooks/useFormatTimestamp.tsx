import { Calendar, CalendarDraft } from '@api/types/calendarTypes'

import { useFormatTimestampUnits } from './useFormatTimestampUnits'

export function useFormatTimestamp({ calendar }: { calendar?: Calendar | CalendarDraft | null }) {
	return useFormatTimestampUnits({
		units: calendar?.units ?? [],
		dateFormatString: calendar?.dateFormat ?? '',
		originTime: calendar ? Number(calendar.originTime) : 0,
	})
}
