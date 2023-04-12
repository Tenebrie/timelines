import { useCallback, useMemo } from 'react'

import { WorldCalendarType } from '../types'

export const useWorldCalendar = () => {
	const availableCalendars: { id: WorldCalendarType; displayName: string }[] = useMemo(
		() => [
			{ id: 'COUNTUP', displayName: 'Count Up Calendar' },
			{ id: 'EARTH', displayName: 'Earth Calendar' },
			{ id: 'PF2E', displayName: 'Golarion Calendar (Pathfinder)' },
			{ id: 'RIMWORLD', displayName: 'Quadrums Calendar (Rimworld)' },
		],
		[]
	)

	const listAllCalendars = useCallback(() => {
		return availableCalendars
	}, [availableCalendars])

	return {
		listAllCalendars,
	}
}
