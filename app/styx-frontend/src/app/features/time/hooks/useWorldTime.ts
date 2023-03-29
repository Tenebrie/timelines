import { useSelector } from 'react-redux'

import { getTimelinePreferences } from '../../preferences/selectors'
import { ScaleLevel } from '../../world/components/Timeline/types'

export const useWorldTime = () => {
	const { lineSpacing } = useSelector(getTimelinePreferences)

	const pixelsPerHour = 4 * lineSpacing

	const daysInYear = 365.2422
	const hoursInDay = 24
	const minutesInHour = 60

	const timeToLabel = (time: number) => {
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

		return `Year ${years}, Day ${days}, ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
	}

	const timeToShortLabel = (time: number, scaleLevel: ScaleLevel) => {
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

		if (scaleLevel === 'minute' || scaleLevel === 'hour') {
			return `Year ${years}, Day ${days}, ${String(hours).padStart(2, '0')}:${String(minutes).padStart(
				2,
				'0'
			)}`
		} else if (scaleLevel === 'day') {
			return `Year ${years}, Day ${days}`
		} else if (scaleLevel === 'month') {
			return `Year ${years}, day ${days}`
		}
	}

	return {
		hoursInDay,
		minutesInHour,
		timeToLabel,
		timeToShortLabel,
	}
}
