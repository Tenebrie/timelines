import { useSearch } from '@tanstack/react-router'
import { useMemo } from 'react'
import { useSelector } from 'react-redux'

import { getTimelineState } from '../../world/selectors'

export const useCurrentEvent = () => {
	const selectedMarkerIds = useSearch({
		from: '/world/$worldId/_world/timeline',
		select: (search) => search.selection,
	})
	const { markers } = useSelector(getTimelineState, (a, b) => a.markers === b.markers)

	const event = useMemo(() => {
		if (selectedMarkerIds.length === 0) {
			return undefined
		}
		const marker = markers.find((m) => m.key === selectedMarkerIds[0])
		return marker
	}, [markers, selectedMarkerIds])

	return {
		id: event?.eventId,
		worldId: event?.worldId,
		event,
	}
}
