import { parseTimestampMultiRoot } from '@neverkin/esoteric-date'
import { useCallback } from 'react'

import { CalendarDraftUnit, CalendarUnit } from '@/api/types/calendarTypes'

export function useParseTimestampToUnits({ units }: { units: CalendarDraftUnit[] | CalendarUnit[] }) {
	const parse = useCallback(
		({ timestamp }: { timestamp: number }) => {
			return parseTimestampMultiRoot({
				allUnits: units,
				timestamp,
			})
		},
		[units],
	)
	return parse
}
