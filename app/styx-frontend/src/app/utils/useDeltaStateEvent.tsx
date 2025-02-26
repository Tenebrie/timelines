import { useSelector } from 'react-redux'

import { mockEventModel } from '../../api/rheaApi.mock'
import { WorldEventDelta } from '../../api/types/types'
import { getWorldState } from '../views/world/WorldSliceSelectors'

export const useDeltaStateEvent = (delta: WorldEventDelta) => {
	const { events } = useSelector(getWorldState)
	const event = events.find((event) => event.id === delta.worldEventId)
	if (!event) {
		return mockEventModel()
	}
	return event
}
