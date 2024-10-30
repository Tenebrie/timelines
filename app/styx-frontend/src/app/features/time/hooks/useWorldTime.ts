import { useCallback, useMemo } from 'react'
import { useSelector } from 'react-redux'

import { ScaleLevel } from '../../world/components/Timeline/types'
import { getWorldState } from '../../world/selectors'
import { WorldCalendarType } from '../../world/types'
import { useWorldCalendar } from './useWorldCalendar'

type Props = {
	calendar?: WorldCalendarType
}

type TimeDefinition = {
	year: number
	monthName: string
	monthNameShort: string
	monthIndex: number
	monthDay: number
	day: number
	hour: number
	minute: number
}

export const maximumTime = 8640000000000000

export const useWorldTime = ({ calendar }: Props = {}) => {
	const { calendar: worldCalendar } = useSelector(getWorldState)

	const msPerUnit = useMemo(() => 60000, []) // Milliseconds per unit
	const daysInYear = useMemo(() => 365.2422, [])
	const hoursInDay = useMemo(() => 24, [])
	const minutesInHour = useMemo(() => 60, [])

	const usedCalendar = useMemo<WorldCalendarType>(() => calendar ?? worldCalendar, [calendar, worldCalendar])

	const { getCalendar } = useWorldCalendar()
	const calendarDefinition = useMemo(() => getCalendar(usedCalendar).definition, [getCalendar, usedCalendar])
	const months = useMemo(
		() =>
			calendarDefinition.engine === 'JS_DATE' ? calendarDefinition.months : calendarDefinition.units.months,
		[calendarDefinition],
	)

	const parseTime = useCallback(
		(rawTime: number): TimeDefinition => {
			let time = rawTime * msPerUnit + calendarDefinition.baseOffset
			if (Math.abs(time) >= maximumTime) {
				time = maximumTime * Math.sign(time)
			} else if (isNaN(time)) {
				time = maximumTime
			}
			if (calendarDefinition.engine === 'JS_DATE' && usedCalendar !== 'COUNTUP') {
				const date = new Date(time)

				return {
					year: date.getUTCFullYear(),
					monthName: calendarDefinition.months[date.getUTCMonth()].name,
					monthNameShort: calendarDefinition.months[date.getUTCMonth()].shortName,
					monthIndex: date.getUTCMonth(),
					monthDay: date.getUTCDate(),
					day: date.getUTCDate(),
					hour: date.getUTCHours(),
					minute: date.getUTCMinutes(),
				}
			} else if (calendarDefinition.engine === 'JS_DATE' && usedCalendar === 'COUNTUP' && rawTime >= 0) {
				const date = new Date(time)

				const year = date.getUTCFullYear()
				const hour = date.getUTCHours()
				const minute = date.getUTCMinutes()

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
					monthName: calendarDefinition.months[date.getUTCMonth()].name,
					monthNameShort: calendarDefinition.months[date.getUTCMonth()].shortName,
					monthIndex: date.getUTCMonth(),
					monthDay: date.getUTCDate(),
					day: day + 1,
					hour,
					minute,
				}
			} else if (calendarDefinition.engine === 'JS_DATE' && usedCalendar === 'COUNTUP' && rawTime < 0) {
				const date = new Date(time)

				const year = date.getUTCFullYear() + 1
				const hour = date.getUTCHours()
				const minute = date.getUTCMinutes()

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
					monthName: calendarDefinition.months[date.getUTCMonth()].name,
					monthNameShort: calendarDefinition.months[date.getUTCMonth()].shortName,
					monthIndex: date.getUTCMonth(),
					monthDay: date.getUTCDate(),
					day: -(365 - day),
					hour,
					minute,
				}
			} else if (calendarDefinition.engine === 'SIMPLE') {
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
							shortName: 'Unk',
							days: Infinity,
							index: 0,
						},
					}
				})()

				return {
					year: years,
					monthName: month.name,
					monthNameShort: month.shortName,
					monthIndex: month.index,
					monthDay: day + 1,
					day: day + 1,
					hour: hours,
					minute: minutes,
				}
			}
			return {
				year: 0,
				monthName: '???',
				monthNameShort: '???',
				monthIndex: 0,
				monthDay: 0,
				day: 0,
				hour: 0,
				minute: 0,
			}
		},
		[calendarDefinition, msPerUnit, usedCalendar],
	)

	const pickerToTimestamp = useCallback(
		(picker: Omit<TimeDefinition, 'monthName' | 'monthNameShort'>) => {
			const { year, monthIndex, day, hour, minute } = picker
			if (calendarDefinition.engine === 'JS_DATE') {
				const targetDate = new Date(0)
				targetDate.setUTCFullYear(year)
				targetDate.setUTCMonth(monthIndex)
				targetDate.setUTCDate(day + 1)
				targetDate.setUTCHours(hour)
				targetDate.setUTCMinutes(minute)
				const value = (targetDate.getTime() - calendarDefinition.baseOffset) / msPerUnit
				if (isNaN(value)) {
					return maximumTime
				}
				return value > maximumTime ? maximumTime : value < -maximumTime ? -maximumTime : value
			} else if (calendarDefinition.engine === 'SIMPLE') {
				const inMillisecond = calendarDefinition.units.inMillisecond
				const inSecond = calendarDefinition.units.inSecond * inMillisecond
				const inMinute = calendarDefinition.units.inMinute * inSecond
				const inHour = calendarDefinition.units.inHour * inMinute
				const inDay = calendarDefinition.units.inDay * inHour
				const inYear =
					calendarDefinition.units.months.reduce((total, current) => total + current.days, 0) * inDay

				const monthDays = (() => {
					if (monthIndex === 0) {
						return 0
					}
					return calendarDefinition.units.months
						.slice(0, monthIndex)
						.reduce((total, current) => total + current.days, 0)
				})()

				const value =
					(inYear * year +
						inDay * monthDays +
						inDay * day +
						inHour * hour +
						inMinute * minute -
						calendarDefinition.baseOffset) /
					msPerUnit

				return value > maximumTime ? maximumTime : value < -maximumTime ? -maximumTime : value
			}

			return 100
		},
		[calendarDefinition, msPerUnit],
	)

	const timeToLabel = useCallback(
		(rawTime: number) => {
			const { year, monthName, day, hour, minute } = parseTime(rawTime)
			if (usedCalendar === 'COUNTUP') {
				const padHours = String(hour).padStart(2, '0')
				const padMinutes = String(minute).padStart(2, '0')

				if (year === 0) {
					return `Day ${day}, ${padHours}:${padMinutes}`
				}

				return `Year ${year}, Day ${day}, ${padHours}:${padMinutes}`
			} else {
				const padHour = String(hour).padStart(2, '0')
				const padMinute = String(minute).padStart(2, '0')

				return `${year}, ${monthName} ${day}, ${padHour}:${padMinute}`
			}
		},
		[parseTime, usedCalendar],
	)

	const timeToShortLabel = useCallback(
		(rawTime: number, scaleLevel: ScaleLevel, groupSize: 'large' | 'medium' | 'small') => {
			const { year, monthName, monthNameShort, day, hour, minute } = parseTime(rawTime)
			if (usedCalendar === 'COUNTUP') {
				const padHours = String(hour).padStart(2, '0')
				const padMinutes = String(minute).padStart(2, '0')

				if (groupSize === 'large') {
					if (year === 0) {
						return `Day ${day}`
					}

					return `Year ${year}, Day ${day}`
				}

				if (groupSize === 'medium') {
					if (scaleLevel === 0) {
						return `${padHours}:${padMinutes}`
					} else if (scaleLevel === 1) {
						if (year === 0) {
							return `Day ${day}`
						}

						return `Year ${year}, Day ${day}`
					} else if (scaleLevel === 2 || scaleLevel === 3) {
						return `${monthNameShort}`
					}
				}

				if (groupSize === 'small') {
					if (scaleLevel === 0 || scaleLevel === 1) {
						return `${padHours}:${padMinutes}`
					} else if (scaleLevel === 2) {
						return `${day}`
					} else if (scaleLevel === 3) {
						return `${day}`
					}
				}
			} else {
				const padDay = String(day).padStart(2, '0')
				const padHour = String(hour).padStart(2, '0')
				const padMinute = String(minute).padStart(2, '0')

				if (groupSize === 'large') {
					if (scaleLevel === 2 || scaleLevel === 3) {
						return `${monthName} ${year}`
					} else if (scaleLevel >= 4) {
						return `Year ${year}`
					}
					return `${monthName} ${padDay}, ${year}`
				}

				if (groupSize === 'medium') {
					if (scaleLevel === 0) {
						return `${padHour}:${padMinute}`
					} else if (scaleLevel === 1) {
						return `${monthNameShort} ${padDay}`
					} else if (scaleLevel === 2) {
						// If months are short, use short month name
						if (([...months].sort((a, b) => a.days - b.days)[0]?.days ?? 0) <= 20) {
							return `${monthNameShort}`
						}
						return `${monthName} ${year}`
					} else if (scaleLevel === 3) {
						// If months are short, use short month name
						if (([...months].sort((a, b) => a.days - b.days)[0]?.days ?? 0) <= 20) {
							return `${monthNameShort}`
						}
						return `${monthName}`
					} else if (scaleLevel === 4) {
						return `${monthName} ${year}`
					} else if (scaleLevel >= 5) {
						return `Year ${year}`
					}
				}

				if (groupSize === 'small') {
					if (scaleLevel === 0) {
						return `${padHour}:${padMinute}`
					} else if (scaleLevel === 1) {
						return `${padHour}:${padMinute}`
					} else if (scaleLevel === 2) {
						return day % 8 === 0 ? `${monthNameShort} ${padDay}` : ''
					} else if (scaleLevel === 4) {
						return `${year}`
					} else if (scaleLevel >= 5) {
						return `${year}`
					}
				}
				return 'No label'
			}
		},
		[months, parseTime, usedCalendar],
	)

	const timeToShortestLabel = useCallback(
		(rawTime: number, scaleLevel: ScaleLevel) => {
			const { year, monthIndex, day, hour, minute } = parseTime(rawTime)
			if (usedCalendar === 'COUNTUP') {
				const padHours = String(hour).padStart(2, '0')
				const padMinutes = String(minute).padStart(2, '0')

				if (scaleLevel === 0 || scaleLevel === 1 || scaleLevel === 2 || scaleLevel === 3) {
					return `${padHours}:${padMinutes}`
				}

				return `Year ${year}, Day ${day}`
			} else if (usedCalendar === 'RIMWORLD') {
				const padMonth = String(monthIndex + 1).padStart(2, '0')
				const padDay = String(day).padStart(2, '0')
				const padHours = String(hour).padStart(2, '0')
				const padMinutes = String(minute).padStart(2, '0')

				if (scaleLevel === 0 || scaleLevel === 1) {
					return `${year}.${padMonth}.${padDay} ${padHours}:${padMinutes}`
				}
				return `${year}.${padMonth}.${padDay}`
			} else {
				const padMonth = String(monthIndex).padStart(2, '0')
				const padDay = String(day).padStart(2, '0')
				const padHour = String(hour).padStart(2, '0')
				const padMinute = String(minute).padStart(2, '0')

				if (scaleLevel === 0) {
					return `${padHour}:${padMinute}`
				} else if (scaleLevel === 1) {
					return `${padHour}:${padMinute}`
				}

				return `${padDay}.${padMonth}`
			}
		},
		[parseTime, usedCalendar],
	)

	return {
		calendar: usedCalendar,
		months,
		daysInYear,
		hoursInDay,
		minutesInHour,
		parseTime,
		pickerToTimestamp,
		timeToLabel,
		timeToShortLabel,
		timeToShortestLabel,
	}
}
