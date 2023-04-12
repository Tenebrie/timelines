import { useCallback, useMemo } from 'react'
import { useSelector } from 'react-redux'

import { ScaleLevel } from '../../world/components/Timeline/types'
import { useWorldCalendar } from '../../world/hooks/useWorldCalendar'
import { getWorldState } from '../../world/selectors'
import { WorldCalendarType } from '../../world/types'

type Props = {
	calendar?: WorldCalendarType
}

export const useWorldTime = ({ calendar }: Props = {}) => {
	const { calendar: worldCalendar } = useSelector(getWorldState)

	const msPerUnit = useMemo(() => 1, []) // Milliseconds per unit
	const unitsPerMs = useMemo(() => 1 / msPerUnit, [msPerUnit])
	const daysInYear = useMemo(() => 365.2422, [])
	const hoursInDay = useMemo(() => 24, [])
	const minutesInHour = useMemo(() => 60, [])

	const usedCalendar = useMemo<WorldCalendarType>(() => calendar ?? worldCalendar, [calendar, worldCalendar])

	const { getCalendar } = useWorldCalendar()
	const calendarDefinition = getCalendar(usedCalendar).definition

	const timeToLabel = useCallback(
		(time: number) => {
			const adjustedTime = time * msPerUnit + calendarDefinition.baseOffset
			if (usedCalendar === 'EARTH' || usedCalendar === 'PF2E') {
				const date = new Date(adjustedTime)

				const years = date.getUTCFullYear()
				const months = String(date.getUTCMonth() + 1).padStart(2, '0')
				const days = String(date.getUTCDate()).padStart(2, '0')
				const hours = String(date.getUTCHours()).padStart(2, '0')
				const minutes = String(date.getUTCMinutes()).padStart(2, '0')

				return `${years}.${months}.${days} ${hours}:${minutes}`
			} else if (usedCalendar === 'COUNTUP') {
				const date = new Date(adjustedTime)

				const years = date.getUTCFullYear()
				const hours = String(date.getUTCHours()).padStart(2, '0')
				const minutes = String(date.getUTCMinutes()).padStart(2, '0')

				const startingYearDate = new Date(adjustedTime)
				startingYearDate.setUTCMilliseconds(0)
				startingYearDate.setUTCSeconds(0)
				startingYearDate.setUTCMinutes(0)
				startingYearDate.setUTCHours(0)
				startingYearDate.setUTCDate(1)
				startingYearDate.setUTCMonth(0)
				const diff = date.getTime() - startingYearDate.getTime()
				const oneDay = 1000 * 60 * 60 * 24
				const days = Math.floor(diff / oneDay)

				if (years === 0) {
					return `Day ${days}, ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
				}

				return `Year ${years}, Day ${days}, ${String(hours).padStart(2, '0')}:${String(minutes).padStart(
					2,
					'0'
				)}`
			} else if (usedCalendar === 'RIMWORLD') {
				const inMillisecond = 1
				const inSecond = 1000 * inMillisecond
				const inMinute = 60 * inSecond
				const inHour = 60 * inMinute
				const inDay = 24 * inHour
				const inYear = 365 * inDay

				const years = Math.floor(time / timeInYear)
				const days = Math.floor((time - years * timeInYear) / timeInDay)
				const hours = Math.floor((time - years * timeInYear - days * timeInDay) / timeInHour)
				const minutes = Math.floor(
					(time - years * timeInYear - days * timeInDay - hours * timeInHour) / timeInMinute
				)

				return ''
			}
		},
		[calendarDefinition, usedCalendar]
	)

	const timeToShortLabel = useCallback(
		(time: number, scaleLevel: ScaleLevel) => {
			const adjustedTime = time * msPerUnit + calendarDefinition.baseOffset
			if (usedCalendar === 'EARTH' || usedCalendar === 'PF2E') {
				const date = new Date(adjustedTime)

				const years = date.getUTCFullYear()
				const months = String(date.getUTCMonth() + 1).padStart(2, '0')
				const days = String(date.getUTCDate()).padStart(2, '0')
				const hours = String(date.getUTCHours()).padStart(2, '0')
				const minutes = String(date.getUTCMinutes()).padStart(2, '0')

				return `${years}.${months}.${days} ${hours}:${minutes}`
			} else if (usedCalendar === 'COUNTUP') {
				// const timeInYear = pixelsPerHour * hoursInDay * daysInYear
				// const timeInDay = pixelsPerHour * hoursInDay
				// const timeInHour = pixelsPerHour
				// const timeInMinute = pixelsPerHour / minutesInHour

				// const years = Math.floor(time / timeInYear)
				// const days = Math.floor((time - years * timeInYear) / timeInDay)
				// const hours = Math.floor((time - years * timeInYear - days * timeInDay) / timeInHour)
				// const minutes = Math.floor(
				// 	(time - years * timeInYear - days * timeInDay - hours * timeInHour) / timeInMinute
				// )

				const date = new Date(adjustedTime)

				const years = date.getUTCFullYear()
				const hours = String(date.getUTCHours()).padStart(2, '0')
				const minutes = String(date.getUTCMinutes()).padStart(2, '0')

				const startingYearDate = new Date(adjustedTime)
				startingYearDate.setUTCMilliseconds(0)
				startingYearDate.setUTCSeconds(0)
				startingYearDate.setUTCMinutes(0)
				startingYearDate.setUTCHours(0)
				startingYearDate.setUTCDate(1)
				startingYearDate.setUTCMonth(0)
				const diff = date.getTime() - startingYearDate.getTime()
				const oneDay = 1000 * 60 * 60 * 24
				const days = Math.floor(diff / oneDay)

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
		[calendarDefinition, usedCalendar]
	)

	return {
		daysInYear,
		hoursInDay,
		minutesInHour,
		timeToLabel,
		timeToShortLabel,
	}
}
