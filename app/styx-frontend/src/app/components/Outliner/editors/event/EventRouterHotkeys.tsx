import { useNavigate, useSearch } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'

import { useEventBusDispatch } from '@/app/features/eventBus'
import { useModal } from '@/app/features/modals/ModalsSlice'
import { Shortcut, useShortcut } from '@/app/hooks/useShortcut/useShortcut'
import { getTimelineState } from '@/app/views/world/WorldSliceSelectors'

export function EventRouterHotkeys() {
	const { selectedMarkerIds, creatingNew } = useSearch({
		from: '/world/$worldId/_world/timeline',
		select: (search) => ({ selectedMarkerIds: search.selection, creatingNew: search.new }),
	})
	const navigate = useNavigate({ from: '/world/$worldId/timeline' })
	const { open: openEditEventModal, isOpen: isModalOpen } = useModal('editEventModal')
	const { markers } = useSelector(getTimelineState, (a, b) => a.markers === b.markers)

	const requestFocus = useEventBusDispatch({ event: 'richEditor/requestFocus' })
	const requestBlur = useEventBusDispatch({ event: 'richEditor/requestBlur' })

	// Track previous URL state to detect transitions
	const prevStateRef = useRef({ creatingNew, selectedMarkerIds })

	useEffect(() => {
		if (!isModalOpen) {
			requestBlur()
		}
	}, [isModalOpen, requestBlur])

	// Open modal when creating new event
	// Only trigger when transitioning TO a create state, not FROM it
	// Note: Modal will NOT open automatically when selecting an event - user must double-click
	useEffect(() => {
		const prev = prevStateRef.current

		// Only open modal if:
		// 1. Modal is not already open AND
		// 2. We're transitioning FROM no create TO a create state
		const wasNotCreating = !prev.creatingNew
		const isNowCreating = creatingNew

		if (!isModalOpen && wasNotCreating && isNowCreating) {
			openEditEventModal({ eventId: null })
			requestFocus()
		}

		// Update ref for next run
		prevStateRef.current = { creatingNew, selectedMarkerIds }
	}, [creatingNew, selectedMarkerIds, markers, isModalOpen, openEditEventModal, requestFocus])

	useShortcut(Shortcut.CreateNew, () => {
		navigate({
			to: '/world/$worldId/timeline',
			search: (prev) => ({ ...prev, selection: [], new: true }),
		})
		openEditEventModal({ eventId: null })
		requestFocus()
	})

	useShortcut(
		Shortcut.EditSelected,
		() => {
			if (selectedMarkerIds.length > 0) {
				const marker = markers.find((m) => m.key === selectedMarkerIds[0])
				if (marker) {
					openEditEventModal({ eventId: marker.eventId })
					requestFocus()
				}
			}
		},
		selectedMarkerIds.length > 0,
	)

	return <></>
}
