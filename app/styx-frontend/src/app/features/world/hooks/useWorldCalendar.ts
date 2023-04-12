import { useCallback, useMemo } from 'react'

import { WorldCalendarType } from '../types'

type CalendarDefinition = {
	baseOffset: number
	units: {
		inMillisecond: number
		inSecond: number
		inMinute: number
		inHour: number
		inDay: number
		months: {
			name: string
			days: number
		}[]
	}
}

export const useWorldCalendar = () => {
	const defaultUnits = useMemo<CalendarDefinition['units']>(
		() => ({
			inMillisecond: 1,
			inSecond: 1000,
			inMinute: 60,
			inHour: 60,
			inDay: 24,
			months: [
				{ name: 'January', days: 31 },
				{ name: 'February', days: 28 },
				{ name: 'March', days: 31 },
				{ name: 'April', days: 30 },
				{ name: 'May', days: 31 },
				{ name: 'June', days: 30 },
				{ name: 'July', days: 31 },
				{ name: 'August', days: 31 },
				{ name: 'September', days: 30 },
				{ name: 'October', days: 31 },
				{ name: 'November', days: 30 },
				{ name: 'December', days: 31 },
			],
		}),
		[]
	)
	const availableCalendars: { id: WorldCalendarType; displayName: string; definition: CalendarDefinition }[] =
		useMemo(
			() => [
				{
					id: 'COUNTUP',
					displayName: 'Count Up Calendar',
					definition: {
						baseOffset: -62167219200000,
						units: defaultUnits,
					},
				},
				{
					id: 'EARTH',
					displayName: 'Earth Calendar',
					definition: {
						baseOffset: 1672531200000,
						units: defaultUnits,
					},
				},
				{
					id: 'PF2E',
					displayName: 'Golarion Calendar (Pathfinder)',
					definition: {
						baseOffset: 1672531200000 + 85203705600000,
						units: {
							...defaultUnits,
							months: [
								{ name: 'Abadius', days: 31 },
								{ name: 'Calistril', days: 28 },
								{ name: 'Pharast', days: 31 },
								{ name: 'Gozran', days: 30 },
								{ name: 'Desnus', days: 31 },
								{ name: 'Sarenith', days: 30 },
								{ name: 'Erastus', days: 31 },
								{ name: 'Arodus', days: 31 },
								{ name: 'Rova', days: 30 },
								{ name: 'Lamashan', days: 31 },
								{ name: 'Neth', days: 30 },
								{ name: 'Kuthona', days: 31 },
							],
						},
					},
				},
				{
					id: 'RIMWORLD',
					displayName: 'Quadrums Calendar (Rimworld)',
					definition: {
						baseOffset: 28512000000000,
						units: {
							...defaultUnits,
							months: [
								{ name: 'Aprimay', days: 15 },
								{ name: 'Jugust', days: 15 },
								{ name: 'Septober', days: 15 },
								{ name: 'Decembary', days: 15 },
							],
						},
					},
				},
			],
			[defaultUnits]
		)

	const getCalendar = useCallback(
		(id: WorldCalendarType) => {
			return availableCalendars.find((calendar) => calendar.id === id)!
		},
		[availableCalendars]
	)

	const listAllCalendars = useCallback(() => {
		return availableCalendars
	}, [availableCalendars])

	return {
		getCalendar,
		listAllCalendars,
	}
}
