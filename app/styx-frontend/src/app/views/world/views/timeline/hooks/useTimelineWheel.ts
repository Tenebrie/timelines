import { isMacOS } from '@tiptap/core'
import { useCallback, useRef } from 'react'

import { useTimelineHorizontalScroll } from './useTimelineHorizontalScroll'

type Props = {
	scrollRef: React.RefObject<number>
	setScroll: (scroll: number) => void
	performZoom: (scrollDirection: number, useMouse: boolean) => void
	containerRef: React.RefObject<HTMLDivElement | null>
}

export const useTimelineWheel = ({ performZoom, containerRef }: Props) => {
	const zoomAccumulator = useRef(0)
	const { handleScroll } = useTimelineHorizontalScroll({ containerRef })

	const onWheel = useCallback(
		(event: WheelEvent) => {
			// Horizontal scrolling with shift key
			if (event.shiftKey && !event.ctrlKey && !event.metaKey) {
				event.preventDefault()
				handleScroll(event.deltaY)
				return
			}

			// Zoom with ctrl/cmd key
			if (!event.ctrlKey && !event.metaKey) {
				return
			}
			event.preventDefault()

			// Accumulate scroll delta for smooth zoom on macOS
			const sensitivity = isMacOS() ? 1 / 75 : 1
			zoomAccumulator.current += event.deltaY * sensitivity

			// Only zoom when accumulator crosses threshold
			if (Math.abs(zoomAccumulator.current) >= 1) {
				const zoomDirection = zoomAccumulator.current > 0 ? 1 : -1
				performZoom(zoomDirection, true)
				zoomAccumulator.current = 0
			}
		},
		[performZoom, handleScroll],
	)

	return {
		onWheel,
	}
}
