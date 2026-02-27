import { useUnrevokeWorldEventMutation } from '@api/worldEventApi'
import { useEffect } from 'react'
import { useSelector } from 'react-redux'

import { useEventBusDispatch } from '@/app/features/eventBus'
import { useModal } from '@/app/features/modals/ModalsSlice'
import { Shortcut, useShortcut } from '@/app/hooks/useShortcut/useShortcut'
import { getSelectedMarkerKeys, getTimelineState } from '@/app/views/world/WorldSliceSelectors'
import { useStableNavigate } from '@/router-utils/hooks/useStableNavigate'

export function EventRouterHotkeys() {
	const selectedMarkerIds = useSelector(getSelectedMarkerKeys)
	const navigate = useStableNavigate({ from: '/world/$worldId/timeline' })
	const { isOpen: isModalOpen } = useModal('editEventModal')
	const { open: openDeleteModal } = useModal('deleteEventModal')
	const { markers } = useSelector(getTimelineState, (a, b) => a.markers === b.markers)
	const [unrevokeWorldEvent] = useUnrevokeWorldEventMutation()

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
			if (selectedMarkerIds.length === 0) {
				return
			}
			navigate({
				to: '/world/$worldId/timeline',
				search: (prev) => ({ ...prev, navi: [selectedMarkerIds[0]] }),
			})
		},
		selectedMarkerIds.length > 0,
	)

	useShortcut(
		Shortcut.DeleteSelected,
		() => {
			if (selectedMarkerIds.length === 0) {
				return
			}
			const target = markers.find((e) => e.key === selectedMarkerIds[0])
			if (!target) {
				return
			}

			if (target.markerType === 'issuedAt') {
				openDeleteModal({
					target,
				})
			} else if (target.markerType === 'revokedAt') {
				unrevokeWorldEvent({
					worldId: target.worldId,
					eventId: target.eventId,
				})
			}
		},
		selectedMarkerIds.length > 0,
	)

	return <></>
}
