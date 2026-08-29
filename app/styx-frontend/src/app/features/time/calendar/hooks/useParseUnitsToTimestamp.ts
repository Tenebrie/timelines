import { type InputParsedTimestamp, resolveParsedTimestamp } from '@neverkin/esoteric-date'
import { useCallback } from 'react'

import { CalendarDraftUnit, CalendarUnit } from '@/api/types/calendarTypes'

export function useParseUnitsToTimestamp({ units }: { units: CalendarDraftUnit[] | CalendarUnit[] }) {
	const parse = useCallback(
		({ parsedTimestamp }: { parsedTimestamp: InputParsedTimestamp }) => {
			return resolveParsedTimestamp({
				allUnits: units,
				parsedTimestamp,
			})
		},
		[units],
	)

	return parse
}
