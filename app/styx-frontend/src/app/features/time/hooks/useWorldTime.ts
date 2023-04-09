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

	const calendar = useMemo<'countdown' | 'earth'>(() => 'earth', [])
	const calendarOffset = useMemo(() => 1672531200000, [])

	const timeToLabel = useCallback(
		(time: number) => {
			if (calendar === 'earth') {
				const adjustedTime = time * 30 * 1000 + calendarOffset
				const date = new Date(adjustedTime)

				const years = date.getUTCFullYear()
				const months = String(date.getUTCMonth() + 1).padStart(2, '0')
				const days = String(date.getUTCDate()).padStart(2, '0')
				const hours = String(date.getUTCHours()).padStart(2, '0')
				const minutes = String(date.getUTCMinutes()).padStart(2, '0')

				return `${years}.${months}.${days} ${hours}:${minutes}`
			} else if (calendar === 'countdown') {
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
			}
		},
		[calendar, calendarOffset, daysInYear, hoursInDay, minutesInHour, pixelsPerHour]
	)

	const timeToShortLabel = useCallback(
		(time: number, scaleLevel: ScaleLevel) => {
			if (calendar === 'earth') {
				const adjustedTime = time * 30 * 1000 + calendarOffset
				const date = new Date(adjustedTime)

				const years = date.getUTCFullYear()
				const months = String(date.getUTCMonth() + 1).padStart(2, '0')
				const days = String(date.getUTCDay() + 1).padStart(2, '0')
				const hours = String(date.getUTCHours()).padStart(2, '0')
				const minutes = String(date.getUTCMinutes()).padStart(2, '0')

				return `${years}.${months}.${days} ${hours}:${minutes}`
			} else if (calendar === 'countdown') {
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
			}
		},
		[calendar, calendarOffset, daysInYear, hoursInDay, minutesInHour, pixelsPerHour]
	)

	return {
		daysInYear,
		hoursInDay,
		minutesInHour,
		timeToLabel,
		timeToShortLabel,
	}
}
