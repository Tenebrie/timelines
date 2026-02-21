import { CalendarDraftUnit, CalendarUnit } from '@api/types/calendarTypes'
import { useCallback } from 'react'

import { parseTimestampMultiRoot } from '../date/utils/parseTimestampMultiRoot'

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
