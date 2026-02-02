import { Calendar } from '@api/types/calendarTypes'

import { useFormatTimestampUnits } from './useFormatTimestampUnits'

export function useFormatTimestamp({ calendar }: { calendar?: Calendar }) {
	return useFormatTimestampUnits({
		units: calendar?.units ?? [],
		dateFormatString: calendar?.dateFormat ?? '',
	})
}
