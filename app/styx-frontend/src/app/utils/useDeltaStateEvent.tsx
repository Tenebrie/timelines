import { useSelector } from 'react-redux'

import { mockEventModel } from '../../api/rheaApi.mock'
import { getWorldState } from '../features/world/selectors'
import { WorldEventDelta } from '../features/world/types'

export const useDeltaStateEvent = (delta: WorldEventDelta) => {
	const { events } = useSelector(getWorldState)
	const event = events.find((event) => event.id === delta.worldEventId)
	if (!event) {
		return mockEventModel()
	}
	return event
}
