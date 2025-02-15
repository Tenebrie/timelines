import { mockEventModel } from '@api/rheaApi.mock'
import { useMemo } from 'react'
import { useSelector } from 'react-redux'

import { getWorldState } from '../../world/selectors'
import { useCurrentEvent } from './useCurrentEvent'

export const useCurrentOrNewEvent = () => {
	const { id: worldId, selectedTime } = useSelector(
		getWorldState,
		(a, b) => a.id === b.id && a.selectedTime === b.selectedTime,
	)
	const { event: currentEvent } = useCurrentEvent()
	const event = useMemo(
		() =>
			currentEvent ??
			mockEventModel({
				worldId,
				name: '',
				description: '',
				descriptionRich: '',
				timestamp: selectedTime,
			}),
		[currentEvent, selectedTime, worldId],
	)
	const mode = currentEvent ? ('edit' as const) : ('create' as const)
	return {
		id: event.id,
		worldId,
		event,
		mode,
	}
}
