import { useCallback, useMemo } from 'react'

import { WorldCalendarType } from '../../world/types'

type CalendarDefinition = {
	baseOffset: number
	timelineScalar: number
	units: {
		inMillisecond: number
		inSecond: number
		inMinute: number
		inHour: number
		inDay: number
		months: {
			name: string
			shortName: string
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
						timelineScalar: 1,
						units: {
							...defaultUnits,
							months: [],
						},
					},
				},
				{
					id: 'EARTH',
					displayName: 'Earth Calendar',
					definition: {
						baseOffset: 1672531200000,
						timelineScalar: 1,
						units: defaultUnits,
					},
				},
				{
					id: 'PF2E',
					displayName: 'Golarion Calendar (Pathfinder)',
					definition: {
						baseOffset: 1672531200000 + 85203705600000,
						timelineScalar: 1,
						units: {
							...defaultUnits,
							months: [
								{ name: 'Abadius', shortName: 'Abad', days: 31 },
								{ name: 'Calistril', shortName: 'Cali', days: 28 },
								{ name: 'Pharast', shortName: 'Phar', days: 31 },
								{ name: 'Gozran', shortName: 'Gozn', days: 30 },
								{ name: 'Desnus', shortName: 'Desn', days: 31 },
								{ name: 'Sarenith', shortName: 'Sarn', days: 30 },
								{ name: 'Erastus', shortName: 'Eras', days: 31 },
								{ name: 'Arodus', shortName: 'Arod', days: 31 },
								{ name: 'Rova', shortName: 'Rova', days: 30 },
								{ name: 'Lamashan', shortName: 'Lama', days: 31 },
								{ name: 'Neth', shortName: 'Neth', days: 30 },
								{ name: 'Kuthona', shortName: 'Kuth', days: 31 },
							],
						},
					},
				},
				{
					id: 'RIMWORLD',
					displayName: 'Quadrums Calendar (Rimworld)',
					definition: {
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
