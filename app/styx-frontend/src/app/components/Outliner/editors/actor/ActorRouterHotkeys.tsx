import { useNavigate, useSearch } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'

import { useEventBusDispatch } from '@/app/features/eventBus'
import { useModal } from '@/app/features/modals/ModalsSlice'
import { Shortcut, useShortcut } from '@/app/hooks/useShortcut/useShortcut'

export function ActorRouterHotkeys() {
	const { selectedMarkerIds, creatingNew } = useSearch({
		from: '/world/$worldId/_world/mindmap',
		select: (search) => ({ selectedMarkerIds: search.selection, creatingNew: search.new }),
	})
	const navigate = useNavigate({ from: '/world/$worldId/mindmap' })
	const { open: openEditActorModal, isOpen: isModalOpen } = useModal('editActorModal')

	const requestFocus = useEventBusDispatch({ event: 'richEditor/requestFocus' })
	const requestBlur = useEventBusDispatch({ event: 'richEditor/requestBlur' })

	// Track previous URL state to detect transitions
	const prevStateRef = useRef({ creatingNew, selectedMarkerIds })

	useEffect(() => {
		if (!isModalOpen) {
			requestBlur()
		}
	}, [isModalOpen, requestBlur])

	// Open modal when creating new actor
	useEffect(() => {
		const prev = prevStateRef.current

		const wasNotCreating = !prev.creatingNew
		const isNowCreating = creatingNew

		if (!isModalOpen && wasNotCreating && isNowCreating) {
			openEditActorModal({ actorId: null })
			requestFocus()
		}

		// Update ref for next run
		prevStateRef.current = { creatingNew, selectedMarkerIds }
	}, [creatingNew, selectedMarkerIds, isModalOpen, openEditActorModal, requestFocus])

	useShortcut(Shortcut.CreateNew, () => {
		navigate({
			to: '/world/$worldId/mindmap',
			search: (prev) => ({ ...prev, selection: [], new: true }),
		})
		openEditActorModal({ actorId: null })
		requestFocus()
	})

	useShortcut(
		Shortcut.EditSelected,
		() => {
			if (selectedMarkerIds.length > 0) {
				openEditActorModal({ actorId: selectedMarkerIds[0] })
				requestFocus()
			}
		},
		selectedMarkerIds.length > 0,
	)

	useShortcut(
		Shortcut.Escape,
		() => {
			navigate({
				to: '/world/$worldId/mindmap',
				search: (prev) => ({ ...prev, selection: [], new: undefined }),
			})
		},
		selectedMarkerIds.length > 0 || creatingNew,
	)

	return <></>
}
