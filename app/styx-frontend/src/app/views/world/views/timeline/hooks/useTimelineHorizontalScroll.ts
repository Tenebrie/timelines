import { isMacOS } from '@tiptap/core'
import { useCallback, useEffect, useRef } from 'react'

import { useEventBusDispatch } from '@/app/features/eventBus'

import { TimelineState } from '../utils/TimelineState'

type Props = {
	containerRef: React.RefObject<HTMLDivElement | null>
}

export const useTimelineHorizontalScroll = ({ containerRef }: Props) => {
	const velocityRef = useRef(0)
	const animationFrameRef = useRef<number | null>(null)
	const scrollTimelineTo = useEventBusDispatch({ event: 'timeline/requestScrollTo' })

	const handleScroll = useCallback(
		(deltaY: number) => {
			// Smooth horizontal timeline scrolling
			const sensitivity = isMacOS() ? 1 / 75 : 1 / 4
			const scrollDelta = deltaY * sensitivity

			// Add to velocity for momentum
			velocityRef.current += scrollDelta

			// Start animation if not already running
			if (animationFrameRef.current === null) {
				const animate = () => {
					if (Math.abs(velocityRef.current) > 0.01) {
						const newScroll = TimelineState.scroll - velocityRef.current
						scrollTimelineTo({ rawScrollValue: newScroll, skipAnim: true })
						velocityRef.current *= 0.8
						animationFrameRef.current = requestAnimationFrame(animate)
					} else {
						velocityRef.current = 0
						animationFrameRef.current = null
					}
				}
				animationFrameRef.current = requestAnimationFrame(animate)
			}
		},
		[scrollTimelineTo],
	)

	const onWheel = useCallback(
		(event: React.WheelEvent) => {
			if (event.ctrlKey || event.metaKey) {
				return
			}
			event.preventDefault()
			const sensitivity = isMacOS() ? 4 : 1
			handleScroll(event.deltaY * sensitivity)
		},
		[handleScroll],
	)

	useEffect(() => {
		const refValue = containerRef.current
		if (!refValue) {
			return
		}

		const onWheelNative = (event: WheelEvent) => {
			if (event.target instanceof Element && !event.target.classList.contains('allow-timeline-click')) {
				event.preventDefault()
			}
		}

		refValue.addEventListener('wheel', onWheelNative, { passive: false })
		return () => refValue.removeEventListener('wheel', onWheelNative)
	}, [containerRef])

	return {
		onWheel,
		handleScroll,
	}
}
