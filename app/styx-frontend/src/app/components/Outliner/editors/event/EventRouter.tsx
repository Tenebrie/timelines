import { useSearch } from '@tanstack/react-router'

import { EventBulkActions } from './bulk/EventBulkActions'
import { EventDetails } from './details/EventDetails'

export function EventRouter() {
	const selectedMarkerIds = useSearch({
		from: '/world/$worldId/_world',
		select: (search) => search.selection,
	})

	return (
		<>
			{selectedMarkerIds.length < 2 && <EventDetails />}
			{selectedMarkerIds.length >= 2 && <EventBulkActions />}
		</>
	)
}
