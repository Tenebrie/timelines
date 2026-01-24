import { useCallback, useRef, useState } from 'react'

import { useEventBusDispatch } from '@/app/features/eventBus'

import { TimelineState } from '../utils/TimelineState'

export const useTimelineAnchorDrag = () => {
	const [isDragging, setIsDragging] = useState(false)
	const dragStartRef = useRef<{ mouseX: number; initialScroll: number } | null>(null)
	const scrollTimelineTo = useEventBusDispatch['timeline/requestScrollTo']()

	const onMouseDown = useCallback((event: React.MouseEvent) => {
		if (event.button !== 0) {
			return
		}
		event.preventDefault()
		setIsDragging(true)
		dragStartRef.current = {
			mouseX: event.clientX,
			initialScroll: TimelineState.scroll,
		}
	}, [])

	const onMouseMove = useCallback(
		(event: MouseEvent) => {
			if (!isDragging || !dragStartRef.current) {
				return
			}

			const deltaX = event.clientX - dragStartRef.current.mouseX
			const newScroll = dragStartRef.current.initialScroll + deltaX

			scrollTimelineTo({ rawScrollValue: newScroll, skipAnim: true })
		},
		[isDragging, scrollTimelineTo],
	)

	const onMouseUp = useCallback(() => {
		setIsDragging(false)
		dragStartRef.current = null
	}, [])

	return {
		isDragging,
		onMouseDown,
		onMouseMove,
		onMouseUp,
	}
}
