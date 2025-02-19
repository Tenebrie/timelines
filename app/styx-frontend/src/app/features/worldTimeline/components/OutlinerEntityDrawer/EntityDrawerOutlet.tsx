import { useSearch } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'

import { EventBulkActions } from '../EventBulkActions/EventBulkActions'
import { EventDetails } from '../EventDetails/EventDetails'

type Props = {
	isOpen: boolean
	preferredOpen: boolean
	onClear: () => void
}

export function EntityDrawerOutlet({ isOpen, preferredOpen, onClear }: Props) {
	const selectedMarkerIds = useSearch({
		from: '/world/$worldId/_world/timeline',
		select: (search) => search.selection,
	})

	const lastSeenIdsRef = useRef(selectedMarkerIds.length)

	useEffect(() => {
		if (selectedMarkerIds.length === lastSeenIdsRef.current) {
			return
		}
		if (selectedMarkerIds.length === 0 && isOpen && !preferredOpen) {
			onClear()
		}
		lastSeenIdsRef.current = selectedMarkerIds.length
	}, [isOpen, onClear, preferredOpen, selectedMarkerIds])

	return (
		<>
			{selectedMarkerIds.length < 2 && <EventDetails />}
			{selectedMarkerIds.length >= 2 && <EventBulkActions />}
		</>
	)
}
