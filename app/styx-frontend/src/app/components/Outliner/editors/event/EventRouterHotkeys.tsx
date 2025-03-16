import { useNavigate, useSearch } from '@tanstack/react-router'
import { useEffect } from 'react'

import { useResizeableDrawer } from '@/app/components/ResizeGrabber/ResizeableDrawerContext'
import { useEventBusDispatch } from '@/app/features/eventBus'
import { Shortcut, useShortcut } from '@/app/hooks/useShortcut/useShortcut'

export function EventRouterHotkeys() {
	const { selectedMarkerIds, creatingNew } = useSearch({
		from: '/world/$worldId/_world/timeline',
		select: (search) => ({ selectedMarkerIds: search.selection, creatingNew: search.new }),
	})
	const navigate = useNavigate({ from: '/world/$worldId/timeline' })

	const { drawerVisible, setDrawerVisible } = useResizeableDrawer()

	const requestFocus = useEventBusDispatch({ event: 'richEditor/requestFocus' })
	const requestBlur = useEventBusDispatch({ event: 'richEditor/requestBlur' })
	useEffect(() => {
		if (!drawerVisible) {
			requestBlur()
		}
	}, [drawerVisible, requestBlur])

	useShortcut(Shortcut.CreateNew, () => {
		navigate({
			to: '/world/$worldId/timeline',
			search: (prev) => ({ ...prev, selection: [], new: true }),
		})
		setDrawerVisible(true)
		requestFocus()
		setTimeout(() => {
			setDrawerVisible(true)
			requestFocus()
		})
	})

	useShortcut(
		Shortcut.EditSelected,
		() => {
			requestFocus()
			setDrawerVisible(true)
		},
		drawerVisible || selectedMarkerIds.length > 0,
	)

	useShortcut(
		Shortcut.Escape,
		() => {
			navigate({
				to: '/world/$worldId/timeline',
				search: (prev) => ({ ...prev, selection: [], new: undefined }),
			})
		},
		selectedMarkerIds.length > 0 || creatingNew,
	)

	return <></>
}
