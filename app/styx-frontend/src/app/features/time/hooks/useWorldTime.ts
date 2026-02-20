import { useCallback, useMemo } from 'react'
import { useSelector } from 'react-redux'

import { getTimelineState, getWorldState } from '@/app/views/world/WorldSliceSelectors'

import { useFormatTimestamp } from '../calendar/hooks/useFormatTimestamp'
import { useParseTimestampToUnits } from '../calendar/hooks/useParseTimestampToUnits'

export const THE_END = 8640000000000000 // The end of time

export function clampTime(timestamp: number) {
	return Math.max(-THE_END, Math.min(timestamp, THE_END))
}

export const useWorldTime = () => {
	const { scaleLevel } = useSelector(getTimelineState, (a, b) => a.scaleLevel === b.scaleLevel)
	const { calendars } = useSelector(getWorldState, (a, b) => a.calendars === b.calendars)
	const worldCalendar = useMemo(() => calendars[0] ?? null, [calendars])
	const presentation = useMemo(
		() =>
			worldCalendar?.presentations[Number(scaleLevel + 1)] ?? {
				units: [],
			},
		[worldCalendar, scaleLevel],
	)

	const parseTime = useParseTimestampToUnits({ units: worldCalendar?.units ?? [] })
	const format = useFormatTimestamp({
		calendar: worldCalendar,
	})
	const timeToLabel = useCallback(
		(rawTime: number, dateFormat?: string) => {
			return format({ timestamp: rawTime, dateFormat })
		},
		[format],
	)

	const richPresentation = useMemo(() => {
		return {
			...presentation,
			smallestUnit: presentation.units[presentation.units.length - 1],
		}
	}, [presentation])

	return {
		calendar: worldCalendar,
		units: worldCalendar?.units ?? [],
		presentation: richPresentation,
		originTime: worldCalendar?.originTime ?? 0,
		parseTime,
		timeToLabel,
	}
}
