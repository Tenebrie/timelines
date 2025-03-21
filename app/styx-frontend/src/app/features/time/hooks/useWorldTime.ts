import { WorldCalendarType } from '@api/types/worldTypes'
import { useCallback, useMemo } from 'react'
import { useSelector } from 'react-redux'

import { ScaleLevel } from '@/app/schema/ScaleLevel'
import { getWorldCalendarState } from '@/app/views/world/WorldSliceSelectors'

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
	const worldCalendar = useSelector(getWorldCalendarState)

	const msPerUnit = useMemo(() => 60000, []) // Milliseconds per unit
	const daysInYear = useMemo(() => 365.2422, [])
	const hoursInDay = useMemo(() => 24, [])
	const minutesInHour = useMemo(() => 60, [])

	const usedCalendar = useMemo<WorldCalendarType>(() => calendar ?? worldCalendar, [calendar, worldCalendar])

	const { getCalendar } = useWorldCalendar()
	// const calendarData = useMemo(() => getCalendar(usedCalendar), [getCalendar, usedCalendar])
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
			if (calendarDefinition.engine === 'SIMPLE') {
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
		[calendarDefinition, msPerUnit],
	)

	const pickerToTimestamp = useCallback(
		(picker: Omit<TimeDefinition, 'monthName' | 'monthNameShort' | 'monthDay'>) => {
			const { year, monthIndex, day, hour, minute } = picker
			if (calendarDefinition.engine === 'SIMPLE') {
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
			const padHour = String(hour).padStart(2, '0')
			const padMinute = String(minute).padStart(2, '0')

			return `${year}, ${monthName} ${day}, ${padHour}:${padMinute}`
		},
		[parseTime],
	)

	const timeToShortLabel = useCallback(
		(rawTime: number, scaleLevel: ScaleLevel, groupSize: 'large' | 'medium' | 'small') => {
			const { year, monthName, monthNameShort, day, hour, minute } = parseTime(rawTime)
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
				if (scaleLevel <= 0) {
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
				if (scaleLevel <= 1) {
					return `${padHour}:${padMinute}`
				} else if (scaleLevel === 2) {
					return day % 7 === 0 ? `${monthNameShort} ${padDay}` : ''
				} else if (scaleLevel >= 4) {
					return `${year}`
				}
			}
			return 'No label'
		},
		[months, parseTime],
	)

	const timeToShortestLabel = useCallback(
		(rawTime: number, scaleLevel: ScaleLevel) => {
			const { year, monthIndex, day, hour, minute } = parseTime(rawTime)
			if (usedCalendar === 'RIMWORLD') {
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
