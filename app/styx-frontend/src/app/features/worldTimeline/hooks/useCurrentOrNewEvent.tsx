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
	const { event, mode } = useMemo(
		() => ({
			event:
				currentEvent ??
				mockEventModel({
					worldId,
					name: '',
					description: '',
					descriptionRich: '',
					timestamp: selectedTime,
				}),
			mode: currentEvent ? ('edit' as const) : ('create' as const),
		}),
		[currentEvent, selectedTime, worldId],
	)
	return {
		id: event.id,
		worldId,
		event,
		mode,
	}
}
