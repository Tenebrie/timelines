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

	const msPerUnit = useMemo(() => 60000, []) // Milliseconds per unit
	const daysInYear = useMemo(() => 365.2422, [])
	const hoursInDay = useMemo(() => 24, [])
	const minutesInHour = useMemo(() => 60, [])

	const usedCalendar = useMemo<WorldCalendarType>(() => calendar ?? worldCalendar, [calendar, worldCalendar])

	const { getCalendar } = useWorldCalendar()
	const calendarDefinition = getCalendar(usedCalendar).definition

	const parseTime = useCallback(
		(rawTime: number) => {
			const time = rawTime * msPerUnit + calendarDefinition.baseOffset
			if (usedCalendar === 'EARTH' || usedCalendar === 'PF2E') {
				const date = new Date(time)

				return {
					year: date.getUTCFullYear(),
					monthName: calendarDefinition.units.months[date.getUTCMonth()].name,
					monthIndex: date.getUTCMonth() + 1,
					day: date.getUTCDate(),
					hour: date.getUTCHours(),
					minute: date.getUTCMinutes(),
				}
			} else if (usedCalendar === 'COUNTUP') {
				const date = new Date(time)

				const year = date.getUTCFullYear()
				const hour = String(date.getUTCHours()).padStart(2, '0')
				const minute = String(date.getUTCMinutes()).padStart(2, '0')

				const startingYearDate = new Date(time)
				startingYearDate.setUTCMilliseconds(0)
				startingYearDate.setUTCSeconds(0)
				startingYearDate.setUTCMinutes(0)
				startingYearDate.setUTCHours(0)
				startingYearDate.setUTCDate(1)
				startingYearDate.setUTCMonth(0)
				const diff = date.getTime() - startingYearDate.getTime()
				const oneDay = 1000 * 60 * 60 * 24
				const day = Math.floor(diff / oneDay)

				return {
					year,
					monthName: 0,
					monthIndex: 0,
					day,
					hour,
					minute,
				}
			} else if (usedCalendar === 'RIMWORLD') {
				const inMillisecond = calendarDefinition.units.inMillisecond
				const inSecond = calendarDefinition.units.inSecond * inMillisecond
				const inMinute = calendarDefinition.units.inMinute * inSecond
				const inHour = calendarDefinition.units.inHour * inMinute
				const inDay = calendarDefinition.units.inDay * inHour
				const inYear =
					calendarDefinition.units.months.reduce((total, current) => total + current.days, 0) * inDay

				const years = Math.floor(time / inYear)
				const days = Math.floor((time - years * inYear) / inDay)
				const hours = Math.floor((time - years * inYear - days * inDay) / inHour)
				const minutes = Math.floor((time - years * inYear - days * inDay - hours * inHour) / inMinute)

				const monthDefinition = calendarDefinition.units.months
				const { day, month } = (() => {
					let currentDay = days
					for (let i = 0; i < monthDefinition.length; i++) {
						const month = monthDefinition[i]
						if (currentDay < month.days) {
							return {
								day: currentDay,
								month: {
									...month,
									index: i,
								},
							}
						}
						currentDay -= month.days
					}
					return {
						day: currentDay,
						month: {
							name: 'Unknown',
							days: Infinity,
							index: 0,
						},
					}
				})()

				return {
					year: years,
					monthName: month.name,
					monthIndex: month.index,
					day,
					hour: hours,
					minute: minutes,
				}
			}
			return {
				year: 0,
				monthName: '???',
				monthIndex: 0,
				day: 0,
				hour: 0,
				minute: 0,
			}
		},
		[
			calendarDefinition.baseOffset,
			calendarDefinition.units.inDay,
			calendarDefinition.units.inHour,
			calendarDefinition.units.inMillisecond,
			calendarDefinition.units.inMinute,
			calendarDefinition.units.inSecond,
			calendarDefinition.units.months,
			msPerUnit,
			usedCalendar,
		]
	)

	const timeToLabel = useCallback(
		(rawTime: number) => {
			const { year, monthName, day, hour, minute } = parseTime(rawTime)
			if (usedCalendar === 'EARTH' || usedCalendar === 'PF2E') {
				const padHour = String(hour).padStart(2, '0')
				const padMinute = String(minute).padStart(2, '0')

				return `${year}, ${monthName} ${day}, ${padHour}:${padMinute}`
			} else if (usedCalendar === 'COUNTUP') {
				const padHours = String(hour).padStart(2, '0')
				const padMinutes = String(minute).padStart(2, '0')

				if (year === 0) {
					return `Day ${day}, ${padHours}:${padMinutes}`
				}

				return `Year ${year}, Day ${day}, ${padHours}:${padMinutes}}`
			} else if (usedCalendar === 'RIMWORLD') {
				const padHours = String(hour).padStart(2, '0')
				const padMinutes = String(minute).padStart(2, '0')

				return `${year}, ${monthName} ${day + 1}, ${padHours}:${padMinutes}`
			}
		},
		[parseTime, usedCalendar]
	)

	const timeToShortLabel = useCallback(
		(rawTime: number, scaleLevel: ScaleLevel) => {
			const { year, monthIndex, day, hour, minute } = parseTime(rawTime)
			if (usedCalendar === 'EARTH' || usedCalendar === 'PF2E') {
				const padMonth = String(monthIndex).padStart(2, '0')
				const padDay = String(day).padStart(2, '0')
				const padHour = String(hour).padStart(2, '0')
				const padMinute = String(minute).padStart(2, '0')

				return `${year}.${padMonth}.${padDay} ${padHour}:${padMinute}`
			} else if (usedCalendar === 'COUNTUP') {
				const padHours = String(hour).padStart(2, '0')
				const padMinutes = String(minute).padStart(2, '0')

				if (scaleLevel === 0 || scaleLevel === 1) {
					if (year === 0) {
						return `Day ${day}, ${padHours}:${padMinutes}`
					}

					return `Year ${year}, Day ${day}, ${padHours}:${padMinutes}}`
				}

				return `Year ${year}, Day ${day}`
			} else if (usedCalendar === 'RIMWORLD') {
				const padMonth = String(monthIndex + 1).padStart(2, '0')
				const padDay = String(day + 1).padStart(2, '0')
				const padHours = String(hour).padStart(2, '0')
				const padMinutes = String(minute).padStart(2, '0')

				if (scaleLevel === 0 || scaleLevel === 1) {
					return `${year}.${padMonth}.${padDay} ${padHours}:${padMinutes}`
				}
				return `${year}.${padMonth}.${padDay}`
			}
		},
		[parseTime, usedCalendar]
	)

	return {
		daysInYear,
		hoursInDay,
		minutesInHour,
		timeToLabel,
		timeToShortLabel,
	}
}
