import { useCallback, useMemo } from 'react'

import { WorldCalendarType } from '../types'

type CalendarDefinition = {
	baseOffset: number
}

export const useWorldCalendar = () => {
	const availableCalendars: { id: WorldCalendarType; displayName: string; definition: CalendarDefinition }[] =
		useMemo(
			() => [
				{
					id: 'COUNTUP',
					displayName: 'Count Up Calendar',
					definition: {
						baseOffset: -62167219200000,
					},
				},
				{
					id: 'EARTH',
					displayName: 'Earth Calendar',
					definition: {
						baseOffset: 1672531200000,
					},
				},
				{
					id: 'PF2E',
					displayName: 'Golarion Calendar (Pathfinder)',
					definition: {
						baseOffset: 1672531200000 + 85203705600000,
					},
				},
				{
					id: 'RIMWORLD',
					displayName: 'Quadrums Calendar (Rimworld)',
					definition: {
						baseOffset: 0,
					},
				},
			],
			[]
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
