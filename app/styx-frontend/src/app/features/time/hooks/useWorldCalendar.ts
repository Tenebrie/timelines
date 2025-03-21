import { WorldCalendarType } from '@api/types/worldTypes'
import { useCallback, useMemo } from 'react'

import { CalendarDefinition, SimpleCalendarUnits, TwelveCustomMonths } from '../types'

export const useWorldCalendar = () => {
	const defaultMonths = useMemo<TwelveCustomMonths>(
		() => [
			{ name: 'January', shortName: 'Jan', days: 31 },
			{ name: 'February', shortName: 'Feb', days: 28 },
			{ name: 'March', shortName: 'Mar', days: 31 },
			{ name: 'April', shortName: 'Apr', days: 30 },
			{ name: 'May', shortName: 'May', days: 31 },
			{ name: 'June', shortName: 'Jun', days: 30 },
			{ name: 'July', shortName: 'Jul', days: 31 },
			{ name: 'August', shortName: 'Aug', days: 31 },
			{ name: 'September', shortName: 'Sep', days: 30 },
			{ name: 'October', shortName: 'Oct', days: 31 },
			{ name: 'November', shortName: 'Nov', days: 30 },
			{ name: 'December', shortName: 'Dec', days: 31 },
		],
		[],
	)
	const defaultUnits = useMemo<SimpleCalendarUnits>(
		() => ({
			inMillisecond: 1,
			inSecond: 1000,
			inMinute: 60,
			inHour: 60,
			inDay: 24,
			months: defaultMonths,
		}),
		[defaultMonths],
	)
	const availableCalendars = useMemo<
		{ id: WorldCalendarType; displayName: string; definition: CalendarDefinition }[]
	>(
		() => [
			{
				id: 'COUNTUP',
				displayName: 'Count Up Calendar',
				definition: {
					engine: 'SIMPLE',
					baseOffset: 31536000000,
					timelineScalar: 1,
					units: {
						...defaultUnits,
						months: [
							{ name: 'Month 01', shortName: 'M01', days: 31 },
							{ name: 'Month 02', shortName: 'M02', days: 28 },
							{ name: 'Month 03', shortName: 'M03', days: 31 },
							{ name: 'Month 04', shortName: 'M04', days: 30 },
							{ name: 'Month 05', shortName: 'M05', days: 31 },
							{ name: 'Month 06', shortName: 'M06', days: 30 },
							{ name: 'Month 07', shortName: 'M07', days: 31 },
							{ name: 'Month 08', shortName: 'M08', days: 31 },
							{ name: 'Month 09', shortName: 'M09', days: 30 },
							{ name: 'Month 10', shortName: 'M10', days: 31 },
							{ name: 'Month 11', shortName: 'M11', days: 30 },
							{ name: 'Month 12', shortName: 'M12', days: 31 },
						],
					},
				},
			},
			{
				id: 'EARTH',
				displayName: 'Earth Calendar',
				definition: {
					// engine: 'JS_DATE',
					// baseOffset: 1672531200000,
					// timelineScalar: 1,
					// months: defaultMonths,
					engine: 'SIMPLE',
					baseOffset: 63797328000000,
					timelineScalar: 1,
					units: defaultUnits,
				},
			},
			{
				id: 'PF2E',
				displayName: 'Golarion Calendar (Pathfinder)',
				definition: {
					engine: 'SIMPLE',
					baseOffset: 148944528000000,
					timelineScalar: 1,
					units: {
						...defaultUnits,
						months: [
							{ name: '(01) Abadius', shortName: 'Abad', days: 31 },
							{ name: '(02) Calistril', shortName: 'Cali', days: 28 },
							{ name: '(03) Pharast', shortName: 'Phar', days: 31 },
							{ name: '(04) Gozran', shortName: 'Gozn', days: 30 },
							{ name: '(05) Desnus', shortName: 'Desn', days: 31 },
							{ name: '(06) Sarenith', shortName: 'Sarn', days: 30 },
							{ name: '(07) Erastus', shortName: 'Eras', days: 31 },
							{ name: '(08) Arodus', shortName: 'Arod', days: 31 },
							{ name: '(09) Rova', shortName: 'Rova', days: 30 },
							{ name: '(10) Lamashan', shortName: 'Lama', days: 31 },
							{ name: '(11) Neth', shortName: 'Neth', days: 30 },
							{ name: '(12) Kuthona', shortName: 'Kuth', days: 31 },
						],
					},
				},
			},
			{
				id: 'RIMWORLD',
				displayName: 'Quadrums Calendar (Rimworld)',
				definition: {
					engine: 'SIMPLE',
					baseOffset: 28512000000000,
					timelineScalar: 1,
					units: {
						...defaultUnits,
						months: [
							{ name: 'Aprimay', shortName: 'Apr', days: 15 },
							{ name: 'Jugust', shortName: 'Jug', days: 15 },
							{ name: 'Septober', shortName: 'Sep', days: 15 },
							{ name: 'Decembary', shortName: 'Dec', days: 15 },
						],
					},
				},
			},
			{
				id: 'EXETHER',
				displayName: 'Exether Calendar',
				definition: {
					engine: 'SIMPLE',
					baseOffset: 37149408000000,
					timelineScalar: 1,
					units: {
						...defaultUnits,
						months: [
							{ name: '(01) Frostmoot', shortName: 'Frost', days: 31 },
							{ name: '(02) Deepsnow', shortName: 'Deep', days: 28 },
							{ name: '(03) Winterwane', shortName: 'Wint', days: 31 },
							{ name: '(04) Rainmoot', shortName: 'Rain', days: 30 },
							{ name: '(05) Palesun', shortName: 'Pale', days: 31 },
							{ name: '(06) Highsun', shortName: 'High', days: 30 },
							{ name: '(07) Firemoot', shortName: 'Fire', days: 31 },
							{ name: '(08) Emberwane', shortName: 'Ember', days: 31 },
							{ name: '(09) Lowsun', shortName: 'Low', days: 30 },
							{ name: '(10) Redfall', shortName: 'Red', days: 31 },
							{ name: '(11) Snowmoot', shortName: 'Snow', days: 30 },
							{ name: '(12) Fellnight', shortName: 'Feln', days: 31 },
						],
					},
				},
			},
		],
		[defaultUnits],
	)

	const getCalendar = useCallback(
		(id: WorldCalendarType) => {
			return availableCalendars.find((calendar) => calendar.id === id)!
		},
		[availableCalendars],
	)

	const listAllCalendars = useCallback(() => {
		return availableCalendars.filter((calendar) => calendar.id !== 'COUNTUP')
	}, [availableCalendars])

	return {
		getCalendar,
		listAllCalendars,
	}
}
