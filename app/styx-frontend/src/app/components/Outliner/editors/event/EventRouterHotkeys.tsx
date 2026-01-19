import { useEffect } from 'react'
import { useSelector } from 'react-redux'

import { useEventBusDispatch } from '@/app/features/eventBus'
import { useModal } from '@/app/features/modals/ModalsSlice'
import { Shortcut, useShortcut } from '@/app/hooks/useShortcut/useShortcut'
import { getSelectedMarkerKeys } from '@/app/views/world/WorldSliceSelectors'
import { useStableNavigate } from '@/router-utils/hooks/useStableNavigate'

export function EventRouterHotkeys() {
	const selectedMarkerIds = useSelector(getSelectedMarkerKeys)
	const navigate = useStableNavigate({ from: '/world/$worldId/timeline' })
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
			to: '/world/$worldId/timeline',
			search: (prev) => ({ ...prev, navi: [], new: 'event' }),
		})
		requestFocus()
	})

	useShortcut(
		Shortcut.EditSelected,
		() => {
			if (selectedMarkerIds.length > 0) {
				navigate({
					to: '/world/$worldId/timeline',
					search: (prev) => ({ ...prev, navi: [selectedMarkerIds[0]] }),
				})
			}
		},
		selectedMarkerIds.length > 0,
	)

	return <></>
}
