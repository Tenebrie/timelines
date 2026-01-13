import { useCallback, useRef } from 'react'

import { useEventBusDispatch } from '@/app/features/eventBus/eventBusDispatch'

export const useNotifyTimelineScrolled = () => {
	const notifyTimelineScrolled = useEventBusDispatch['timeline/onScroll']()
	const animationFrameRef = useRef<number | null>(null)
	const targetScrollRef = useRef<number>(0)
	const currentScrollRef = useRef<number>(0)
	const isAnimatingRef = useRef<boolean>(false)

	const animateScroll = useCallback(() => {
		if (!isAnimatingRef.current) return

		// Smooth interpolation with easing
		const diff = targetScrollRef.current - currentScrollRef.current
		// TODO: Move easing to preferences
		const easing = 1 // Adjust this value for smoother/faster transitions

		if (Math.abs(diff) < 0.1) {
			// Close enough, snap to target
			currentScrollRef.current = targetScrollRef.current
			isAnimatingRef.current = false
		} else {
			// Continue smoothing
			currentScrollRef.current += diff * easing
			animationFrameRef.current = requestAnimationFrame(animateScroll)
		}

		notifyTimelineScrolled(Math.round(currentScrollRef.current))
	}, [notifyTimelineScrolled])

	return useCallback(
		(scroll: number) => {
			// Update target scroll position
			targetScrollRef.current = scroll

			// Initialize current position if not set
			if (currentScrollRef.current === 0) {
				currentScrollRef.current = scroll
			}

			// Start animation if not already running
			if (!isAnimatingRef.current) {
				isAnimatingRef.current = true
				animationFrameRef.current = requestAnimationFrame(animateScroll)
			}
		},
		[animateScroll],
	)
}
