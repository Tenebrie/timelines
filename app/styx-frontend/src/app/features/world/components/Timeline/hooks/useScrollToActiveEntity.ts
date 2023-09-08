import { useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'

import { useTimelineBusDispatch } from '../../../hooks/useTimelineBus'
import { useWorldRouter } from '../../../router'
import { getWorldState } from '../../../selectors'

export const useScrollToActiveEntity = () => {
	const { eventEditorParams, eventDeltaEditorParams } = useWorldRouter()

	const { events } = useSelector(getWorldState)

	const scrollTimelineTo = useTimelineBusDispatch()
	const lastSeenEventId = useRef<string | null>(null)
	const lastSeenEventDeltaId = useRef<string | null>(null)
	useEffect(() => {
		if (!eventEditorParams.eventId) {
			return
		}
		const event = events.find((e) => e.id === eventEditorParams.eventId)
		if (!event) {
			return
		}

		if (eventDeltaEditorParams.deltaId && eventDeltaEditorParams.deltaId !== lastSeenEventDeltaId.current) {
			const delta = event.deltaStates.find((delta) => delta.id === eventDeltaEditorParams.deltaId)
			if (!delta) {
				return
			}

			scrollTimelineTo(delta.timestamp)
			lastSeenEventDeltaId.current = eventDeltaEditorParams.deltaId
			lastSeenEventId.current = null
		} else if (
			!eventDeltaEditorParams.deltaId &&
			eventEditorParams.eventId &&
			eventEditorParams.eventId !== lastSeenEventId.current
		) {
			scrollTimelineTo(event.timestamp)
			lastSeenEventId.current = eventEditorParams.eventId
			lastSeenEventDeltaId.current = null
		}
	}, [eventDeltaEditorParams.deltaId, eventEditorParams, events, scrollTimelineTo])
}
