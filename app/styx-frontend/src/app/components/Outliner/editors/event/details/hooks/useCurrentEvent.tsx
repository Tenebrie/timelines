import { useSearch } from '@tanstack/react-router'
import { useMemo } from 'react'
import { useSelector } from 'react-redux'

import { getTimelineState, getWorldState } from '@/app/views/world/WorldSliceSelectors'

export const useCurrentEvent = () => {
	const selectedMarkerIds = useSearch({
		from: '/world/$worldId/_world',
		select: (search) => search.selection,
	})
	const { markers } = useSelector(getTimelineState, (a, b) => a.markers === b.markers)
	const { events } = useSelector(getWorldState, (a, b) => a.events === b.events)

	const event = useMemo(() => {
		if (selectedMarkerIds.length === 0) {
			return undefined
		}
		const matchingMarkers = markers.filter((a) => selectedMarkerIds.includes(a.key))
		if (matchingMarkers.length > 0) {
			return matchingMarkers[0]
		}
		const matchingEvents = events.filter((a) => selectedMarkerIds.includes(a.id))
		if (matchingEvents.length > 0) {
			return {
				...matchingEvents[0],
				eventId: matchingEvents[0].id,
			}
		}
		return undefined
	}, [events, markers, selectedMarkerIds])

	return {
		id: event?.eventId,
		worldId: event?.worldId,
		event,
	}
}
