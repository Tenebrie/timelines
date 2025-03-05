import { useSearch } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'

import { useResizeableDrawer } from '@/app/components/ResizeGrabber/ResizeableDrawerContext'
import { EventDetails } from '@/app/views/world/views/timeline/shelf/drawers/event/details/EventDetails'

import { EventBulkActions } from './bulk/EventBulkActions'

export function EventDrawerOutlet() {
	const { drawerVisible, setDrawerVisible } = useResizeableDrawer()

	const selectedMarkerIds = useSearch({
		from: '/world/$worldId/_world/timeline',
		select: (search) => search.selection,
	})

	const lastSeenIdsRef = useRef(selectedMarkerIds.length)

	useEffect(() => {
		if (selectedMarkerIds.length === lastSeenIdsRef.current) {
			return
		}
		if (selectedMarkerIds.length > 0 && !drawerVisible) {
			setDrawerVisible(true)
		} else if (selectedMarkerIds.length === 0 && drawerVisible) {
			setDrawerVisible(false)
		}
		lastSeenIdsRef.current = selectedMarkerIds.length
	}, [drawerVisible, setDrawerVisible, selectedMarkerIds])

	return (
		<>
			{selectedMarkerIds.length < 2 && <EventDetails />}
			{selectedMarkerIds.length >= 2 && <EventBulkActions />}
		</>
	)
}
