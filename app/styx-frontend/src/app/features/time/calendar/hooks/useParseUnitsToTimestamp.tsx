import { CalendarDraftUnit, CalendarUnit } from '@api/types/calendarTypes'
import { useCallback } from 'react'

import { InputParsedTimestamp } from '../date/types'
import { resolveParsedTimestamp } from '../date/utils/resolveParsedTimestamp'

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
