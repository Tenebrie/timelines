import { useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useSelector } from 'react-redux'

import { useEventBusDispatch } from '@/app/features/eventBus'
import { useModal } from '@/app/features/modals/ModalsSlice'
import { Shortcut, useShortcut } from '@/app/hooks/useShortcut/useShortcut'
import { getSelectedMarkerKeys } from '@/app/views/world/WorldSliceSelectors'

export function ActorRouterHotkeys() {
	const selectedMarkerIds = useSelector(getSelectedMarkerKeys)
	const navigate = useNavigate({ from: '/world/$worldId/mindmap' })
	const { isOpen: isModalOpen } = useModal('editEventModal')

	const requestFocus = useEventBusDispatch['richEditor/requestFocus']()
	const requestBlur = useEventBusDispatch['richEditor/requestBlur']()

	useEffect(() => {
		if (!isModalOpen) {
			requestBlur()
		}
	}, [isModalOpen, requestBlur])

	useShortcut(Shortcut.CreateNew, () => {
		navigate({
			to: '/world/$worldId/mindmap',
			search: (prev) => ({ ...prev, selection: [], new: 'actor' }),
		})
		requestFocus()
	})

	useShortcut(
		Shortcut.EditSelected,
		() => {
			if (selectedMarkerIds.length > 0) {
				navigate({
					to: '/world/$worldId/mindmap',
					search: (prev) => ({ ...prev, selection: [selectedMarkerIds[0]] }),
				})
			}
		},
		selectedMarkerIds.length > 0,
	)

	return <></>
}
