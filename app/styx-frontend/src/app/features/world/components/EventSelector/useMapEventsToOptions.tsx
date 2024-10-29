import { useCallback } from 'react'

import { WorldEvent } from '../../types'

export const useMapEventsToOptions = () => {
	const mapSingleEventToOption = useCallback((targetEvent: WorldEvent | null | undefined) => {
		if (!targetEvent) {
			return null
		}

		return {
			...targetEvent,
			label: `${targetEvent.name}`,
		}
	}, [])

	const mapEventsToOptions = useCallback(
		(targetEvents: WorldEvent[]) =>
			targetEvents.map((event) => ({
				...event,
				label: `${event.name}`,
			})),
		[],
	)

	return {
		mapSingleEventToOption,
		mapEventsToOptions,
	}
}
