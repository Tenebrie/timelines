import { RefObject, useEffect, useRef } from 'react'

import { useEventBusDispatch } from '@/app/features/eventBus'

import { useAnchorTimeDragDrop } from './useAnchorTimeDragDrop'

type Props = {
	containerRef: RefObject<HTMLDivElement | null>
}

export function useTimelineDragAutoScroll({ containerRef }: Props) {
	const requestScrollTo = useEventBusDispatch['timeline/requestScrollTo']()

	const scrollValueRef = useRef(0)
	const currentIntervalRef = useRef(0)

	useAnchorTimeDragDrop({
		onTimeChange: (dragPosition) => {
			if (!containerRef.current) {
				return
			}

			const containerRect = containerRef.current.getBoundingClientRect()
			const containerLeft = containerRect.left
			const containerRight = containerRect.right

			const scrollThreshold = 100 // Pixels from the edge to start auto-scrolling
			const scrollSpeed = 20

			function scrollFunc() {
				// requestScrollTo({ rawScrollValue: TimelineState.scroll - scrollValueRef.current, skipAnim: true })
				containerRef.current?.scrollBy({ left: scrollValueRef.current })
			}
			if (dragPosition < containerLeft + scrollThreshold) {
				if (!currentIntervalRef.current) {
					currentIntervalRef.current = window.setInterval(() => scrollFunc(), 5)
				}

				const dist = containerLeft - dragPosition + scrollThreshold
				const speedMod = Math.min(dist * (1 / scrollThreshold), 5)
				scrollValueRef.current = -scrollSpeed * speedMod
			} else if (dragPosition > containerRight - scrollThreshold) {
				if (!currentIntervalRef.current) {
					currentIntervalRef.current = window.setInterval(() => scrollFunc(), 5)
				}

				const dist = dragPosition - containerRight + scrollThreshold
				const speedMod = Math.min(dist * (1 / scrollThreshold), 5)
				scrollValueRef.current = scrollSpeed * speedMod
			} else {
				clearInterval(currentIntervalRef.current)
				currentIntervalRef.current = 0
			}
		},
		onClear: () => {
			clearInterval(currentIntervalRef.current)
			currentIntervalRef.current = 0
			scrollValueRef.current = 0
		},
	})

	useEffect(() => {
		return () => {
			clearInterval(currentIntervalRef.current)
			currentIntervalRef.current = 0
		}
	})
}
