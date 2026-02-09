import { useCallback, useMemo } from 'react'
import { useSelector } from 'react-redux'

import { ScaleLevel } from '@/app/schema/ScaleLevel'
import { getWorldState } from '@/app/views/world/WorldSliceSelectors'

import { useFormatTimestamp } from '../calendar/hooks/useFormatTimestamp'
import { useParseTimestampToUnits } from '../calendar/hooks/useParseTimestampToUnits'
import { useWorldCalendar } from './useWorldCalendar'

type Props = {
	scaleLevel?: ScaleLevel
}

export const maximumTime = 8640000000000000

export const useWorldTime = ({ scaleLevel }: Props = {}) => {
	// const worldCalendar = useSelector(getWorldCalendarState)
	const { calendars } = useSelector(getWorldState, (a, b) => a.calendars === b.calendars)
	const worldCalendar = calendars[0] ?? {
		units: [],
		presentations: [],
		originTime: 0,
	}
	const presentation = worldCalendar?.presentations[Number(scaleLevel)] ?? {
		units: [],
	}

	const msPerUnit = useMemo(() => 60000, []) // Milliseconds per unit
	const daysInYear = useMemo(() => 365.2422, [])
	const hoursInDay = useMemo(() => 24, [])
	const minutesInHour = useMemo(() => 60, [])

	// const usedCalendar = useMemo<WorldCalendarType>(() => calendar ?? worldCalendar, [calendar, worldCalendar])

	const { getCalendar } = useWorldCalendar()
	// const calendarData = useMemo(() => getCalendar(usedCalendar), [getCalendar, usedCalendar])
	// const calendarDefinition = useMemo(() => getCalendar(usedCalendar).definition, [getCalendar, usedCalendar])
	// const months = useMemo(
	// 	() =>
	// 		calendarDefinition.engine === 'JS_DATE' ? calendarDefinition.months : calendarDefinition.units.months,
	// 	[calendarDefinition],
	// )

	// const parseTime = useCallback(
	// 	(rawTime: number): TimeDefinition => {
	// 		let time = rawTime * msPerUnit + calendarDefinition.baseOffset
	// 		if (Math.abs(time) >= maximumTime) {
	// 			time = maximumTime * Math.sign(time)
	// 		}
	// 		if (isNaN(time)) {
	// 			time = maximumTime
	// 		}
	// 		if (calendarDefinition.engine === 'SIMPLE') {
	// 			const inMillisecond = calendarDefinition.units.inMillisecond
	// 			const inSecond = calendarDefinition.units.inSecond * inMillisecond
	// 			const inMinute = calendarDefinition.units.inMinute * inSecond
	// 			const inHour = calendarDefinition.units.inHour * inMinute
	// 			const inDay = calendarDefinition.units.inDay * inHour
	// 			const inYear =
	// 				calendarDefinition.units.months.reduce((total, current) => total + current.days, 0) * inDay

	// 			const years = Math.floor(time / inYear)
	// 			const days = Math.floor((time - years * inYear) / inDay)
	// 			const hours = Math.floor((time - years * inYear - days * inDay) / inHour)
	// 			const minutes = Math.floor((time - years * inYear - days * inDay - hours * inHour) / inMinute)

	// 			const monthDefinition = calendarDefinition.units.months
	// 			const { day, month } = (() => {
	// 				let currentDay = days
	// 				for (let i = 0; i < monthDefinition.length; i++) {
	// 					const month = monthDefinition[i]
	// 					if (currentDay < month.days) {
	// 						return {
	// 							day: currentDay,
	// 							month: {
	// 								...month,
	// 								index: i,
	// 							},
	// 						}
	// 					}
	// 					currentDay -= month.days
	// 				}
	// 				return {
	// 					day: currentDay,
	// 					month: {
	// 						name: 'Unknown',
	// 						shortName: 'Unk',
	// 						days: Infinity,
	// 						index: 0,
	// 					},
	// 				}
	// 			})()

	// 			return {
	// 				year: years,
	// 				monthName: month.name,
	// 				monthNameShort: month.shortName,
	// 				monthIndex: month.index,
	// 				monthDay: day + 1,
	// 				day: day + 1,
	// 				hour: hours,
	// 				minute: minutes,
	// 			}
	// 		}
	// 		return {
	// 			year: 0,
	// 			monthName: '???',
	// 			monthNameShort: '???',
	// 			monthIndex: 0,
	// 			monthDay: 0,
	// 			day: 0,
	// 			hour: 0,
	// 			minute: 0,
	// 		}
	// 	},
	// 	[calendarDefinition, msPerUnit],
	// )

	// const pickerToTimestamp = useCallback(
	// 	(picker: Omit<TimeDefinition, 'monthName' | 'monthNameShort' | 'monthDay'>) => {
	// 		const { year, monthIndex, day, hour, minute } = picker
	// 		if (calendarDefinition.engine === 'SIMPLE') {
	// 			const inMillisecond = calendarDefinition.units.inMillisecond
	// 			const inSecond = calendarDefinition.units.inSecond * inMillisecond
	// 			const inMinute = calendarDefinition.units.inMinute * inSecond
	// 			const inHour = calendarDefinition.units.inHour * inMinute
	// 			const inDay = calendarDefinition.units.inDay * inHour
	// 			const inYear =
	// 				calendarDefinition.units.months.reduce((total, current) => total + current.days, 0) * inDay

	// 			const monthDays = (() => {
	// 				if (monthIndex === 0) {
	// 					return 0
	// 				}
	// 				return calendarDefinition.units.months
	// 					.slice(0, monthIndex)
	// 					.reduce((total, current) => total + current.days, 0)
	// 			})()

	// 			const value =
	// 				(inYear * year +
	// 					inDay * monthDays +
	// 					inDay * day +
	// 					inHour * hour +
	// 					inMinute * minute -
	// 					calendarDefinition.baseOffset) /
	// 				msPerUnit

	// 			return value > maximumTime ? maximumTime : value < -maximumTime ? -maximumTime : value
	// 		}

	// 		return 100
	// 	},
	// 	[calendarDefinition, msPerUnit],
	// )

	const parseTime = useParseTimestampToUnits({ units: worldCalendar.units })
	const format = useFormatTimestamp({
		calendar: worldCalendar,
	})
	const timeToLabel = useCallback(
		(rawTime: number) => {
			return format({ timestamp: rawTime })
		},
		[format],
	)

	const timeToShortLabel = useCallback(
		(rawTime: number, scaleLevel: ScaleLevel, groupSize: 'large' | 'medium' | 'small') => {
			// Check if this timestamp would be out of range before parsing
			const maxRawTime = maximumTime - worldCalendar.originTime
			const minRawTime = -maximumTime - worldCalendar.originTime

			if (rawTime > maxRawTime || rawTime < minRawTime) {
				return null
			}

			return format({ timestamp: rawTime })
		},
		[format, worldCalendar.originTime],
	)

	const timeToShortestLabel = useCallback(
		(rawTime: number, scaleLevel: ScaleLevel) => {
			const maxRawTime = maximumTime - worldCalendar.originTime
			const minRawTime = -maximumTime - worldCalendar.originTime

			if (rawTime > maxRawTime || rawTime < minRawTime) {
				return null
			}

			return format({ timestamp: rawTime })
		},
		[format, worldCalendar.originTime],
	)

	return {
		units: worldCalendar.units,
		presentation,
		parseTime,
		timeToLabel,
		timeToShortLabel,
		timeToShortestLabel,
	}
}
