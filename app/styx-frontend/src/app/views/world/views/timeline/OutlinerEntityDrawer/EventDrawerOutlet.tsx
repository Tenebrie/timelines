import { useSearch } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'

import { useResizeableDrawer } from '@/app/components/ResizeGrabber/ResizeableDrawerContext'
import { EventDetails } from '@/app/views/world/views/timeline/EventDetails/EventDetails'
import { EventBulkActions } from '@/app/views/world/views/timeline/OutlinerEntityDrawer/EventBulkActions/EventBulkActions'

export function EventDrawerOutlet() {
	const { drawerVisible, preferredOpen, setDrawerVisible } = useResizeableDrawer()

	const selectedMarkerIds = useSearch({
		from: '/world/$worldId/_world/timeline',
		select: (search) => search.selection,
	})

	const lastSeenIdsRef = useRef(selectedMarkerIds.length)

	useEffect(() => {
		if (selectedMarkerIds.length === lastSeenIdsRef.current) {
			return
		}
		if (selectedMarkerIds.length === 0 && drawerVisible && !preferredOpen) {
			setDrawerVisible(false)
		}
		lastSeenIdsRef.current = selectedMarkerIds.length
	}, [drawerVisible, setDrawerVisible, preferredOpen, selectedMarkerIds])

	return (
		<>
			{selectedMarkerIds.length < 2 && <EventDetails />}
			{selectedMarkerIds.length >= 2 && <EventBulkActions />}
		</>
	)
}
