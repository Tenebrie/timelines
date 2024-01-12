import { useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'

import { useWorldRouter, worldRoutes } from '../../../../../../router/routes/worldRoutes'
import { useTimelineBusDispatch } from '../../../hooks/useTimelineBus'
import { getWorldState } from '../../../selectors'

export const useScrollToActiveEntity = () => {
	const { stateOf } = useWorldRouter()
	const { eventId, deltaId } = stateOf(worldRoutes.eventDeltaEditor)

	const { events } = useSelector(getWorldState)

	const scrollTimelineTo = useTimelineBusDispatch()
	const lastSeenEventId = useRef<string | null>(null)
	const lastSeenEventDeltaId = useRef<string | null>(null)
	useEffect(() => {
		if (!eventId) {
			lastSeenEventId.current = null
			lastSeenEventDeltaId.current = null

			return
		}
		const event = events.find((e) => e.id === eventId)
		if (!event) {
			return
		}

		if (deltaId && deltaId !== lastSeenEventDeltaId.current) {
			const delta = event.deltaStates.find((delta) => delta.id === deltaId)
			if (!delta) {
				return
			}

			scrollTimelineTo(delta.timestamp)
			lastSeenEventDeltaId.current = deltaId
			lastSeenEventId.current = null
		} else if (!deltaId && eventId && eventId !== lastSeenEventId.current) {
			scrollTimelineTo(event.timestamp)
			lastSeenEventId.current = eventId
			lastSeenEventDeltaId.current = null
		}
	}, [eventId, deltaId, events, scrollTimelineTo])
}
