import { useCallback, useMemo } from 'react'
import { useSelector } from 'react-redux'

import { getTimelinePreferences } from '../../preferences/selectors'
import { ScaleLevel } from '../../world/components/Timeline/types'

export const useWorldTime = () => {
	const { lineSpacing } = useSelector(getTimelinePreferences)

	const pixelsPerHour = useMemo(() => 6 * lineSpacing, [lineSpacing])

	const daysInYear = useMemo(() => 365.2422, [])
	const hoursInDay = useMemo(() => 24, [])
	const minutesInHour = useMemo(() => 60, [])

	const timeToLabel = useCallback(
		(time: number) => {
			const timeInYear = pixelsPerHour * hoursInDay * daysInYear
			const timeInDay = pixelsPerHour * hoursInDay
			const timeInHour = pixelsPerHour
			const timeInMinute = pixelsPerHour / minutesInHour

			const years = Math.floor(time / timeInYear)
			const days = Math.floor((time - years * timeInYear) / timeInDay)
			const hours = Math.floor((time - years * timeInYear - days * timeInDay) / timeInHour)
			const minutes = Math.floor(
				(time - years * timeInYear - days * timeInDay - hours * timeInHour) / timeInMinute
			)

			// return {
			// 	values: [days, hours, minutes],
			// 	labels: ['D', 'H', 'M'],
			// }
			if (years === 0) {
				return `Day ${days}, ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
			}

			return `Year ${years}, Day ${days}, ${String(hours).padStart(2, '0')}:${String(minutes).padStart(
				2,
				'0'
			)}`
		},
		[daysInYear, hoursInDay, minutesInHour, pixelsPerHour]
	)

	const timeToShortLabel = useCallback(
		(time: number, scaleLevel: ScaleLevel) => {
			const timeInYear = pixelsPerHour * hoursInDay * daysInYear
			const timeInDay = pixelsPerHour * hoursInDay
			const timeInHour = pixelsPerHour
			const timeInMinute = pixelsPerHour / minutesInHour

			const years = Math.floor(time / timeInYear)
			const days = Math.floor((time - years * timeInYear) / timeInDay)
			const hours = Math.floor((time - years * timeInYear - days * timeInDay) / timeInHour)
			const minutes = Math.floor(
				(time - years * timeInYear - days * timeInDay - hours * timeInHour) / timeInMinute
			)

			if (scaleLevel === 0 || scaleLevel === 1) {
				return `Year ${years}, Day ${days}, ${String(hours).padStart(2, '0')}:${String(minutes).padStart(
					2,
					'0'
				)}`
			} else if (scaleLevel === 2) {
				return `Year ${years}, Day ${days}`
			} else if (scaleLevel === 3) {
				return `Year ${years}, Day ${days}`
			}
		},
		[daysInYear, hoursInDay, minutesInHour, pixelsPerHour]
	)

	return {
		daysInYear,
		hoursInDay,
		minutesInHour,
		timeToLabel,
		timeToShortLabel,
	}
}
