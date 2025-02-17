import { useSearch } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'

import { EventBulkActions } from '../EventBulkActions/EventBulkActions'
import { EventDetails } from '../EventDetails/EventDetails'

type Props = {
	isOpen: boolean
	onClear: () => void
}

export function EntityDrawerOutlet({ isOpen, onClear }: Props) {
	const selectedMarkerIds = useSearch({
		from: '/world/$worldId/_world/timeline',
		select: (search) => search.selection,
	})

	const isOpenRef = useRef(false)
	const isControlledExternally = useRef(false)

	useEffect(() => {
		if (selectedMarkerIds.length === 0 && isOpenRef.current && !isControlledExternally.current) {
			onClear()
		}
		isOpenRef.current = selectedMarkerIds.length > 0
	}, [onClear, selectedMarkerIds])

	useEffect(() => {
		isControlledExternally.current = isOpen !== isOpenRef.current
	}, [isOpen])

	return (
		<>
			{selectedMarkerIds.length < 2 && <EventDetails />}
			{selectedMarkerIds.length >= 2 && <EventBulkActions />}
		</>
	)
}
