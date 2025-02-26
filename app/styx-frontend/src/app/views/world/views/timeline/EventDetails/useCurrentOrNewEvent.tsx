import { mockEventModel } from '@api/rheaApi.mock'
import { useMemo } from 'react'
import { useSelector } from 'react-redux'

import { getRandomEntityColor } from '@/app/utils/colors/getRandomEntityColor'
import { getWorldState } from '@/app/views/world/WorldSliceSelectors'

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
					color: getRandomEntityColor(),
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
