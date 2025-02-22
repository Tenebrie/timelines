import { useSearch } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'

import { useResizeableDrawer } from '@/app/components/ResizeGrabber/ResizeableDrawerContext'

import { ActorDetails } from './ActorDetails'

export function ActorDrawerOutlet() {
	const { drawerVisible, preferredOpen, setDrawerVisible } = useResizeableDrawer()

	const selectedActorIds = useSearch({
		from: '/world/$worldId/_world/mindmap',
		select: (search) => search.selection,
	})

	const lastSeenIdsRef = useRef(selectedActorIds.length)

	useEffect(() => {
		if (selectedActorIds.length === lastSeenIdsRef.current) {
			return
		}
		if (selectedActorIds.length === 0 && drawerVisible && !preferredOpen) {
			setDrawerVisible(false)
		}
		lastSeenIdsRef.current = selectedActorIds.length
	}, [drawerVisible, setDrawerVisible, preferredOpen, selectedActorIds])

	return (
		<>
			{selectedActorIds.length < 2 && <ActorDetails />}
			{selectedActorIds.length >= 2 && <>Actor bulk actions</>}
		</>
	)
}
