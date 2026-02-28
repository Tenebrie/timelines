import { CalendarDraftUnit, CalendarUnit } from '@api/types/calendarTypes'
import { useCallback } from 'react'

import { formatTimestampUnits } from '../date/utils/formatTimestampUnits'
import { parseTimestampMultiRoot } from '../date/utils/parseTimestampMultiRoot'

export function useFormatTimestampUnits({
	units,
	dateFormatString,
	originTime = 0,
}: {
	units: CalendarUnit[] | CalendarDraftUnit[]
	dateFormatString: string
	originTime?: number
}) {
	const format = useCallback(
		({ timestamp, dateFormat }: { timestamp: number; dateFormat?: string }) => {
			const dateFormatToUse = dateFormat ?? dateFormatString
			const parsed = parseTimestampMultiRoot({ allUnits: units, timestamp: timestamp + originTime })
			const formatted = formatTimestampUnits(units, parsed, dateFormatToUse)
			return formatted.substring(0, 1).toUpperCase() + formatted.substring(1)
		},
		[dateFormatString, originTime, units],
	)

	return format
}
