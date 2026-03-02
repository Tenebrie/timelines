import bezier from 'bezier-easing'
import { useCallback, useRef } from 'react'
import { useSelector } from 'react-redux'

import { useEventBusSubscribe } from '@/app/features/eventBus'
import { getTimelinePreferences } from '@/app/features/preferences/PreferencesSliceSelectors'

type Props = {
	containerRef: React.RefObject<HTMLDivElement | null>
	scrollRef: React.RefObject<number>
	minimumScroll: number
	maximumScroll: number
	realTimeToScaledTime: (time: number) => number
	setScroll: (scroll: number) => void
}

export const useTimelineExternalScroll = ({
	containerRef,
	scrollRef,
	minimumScroll,
	maximumScroll,
	realTimeToScaledTime,
	setScroll,
}: Props) => {
	const startedScrollFrom = useRef(0)
	const desiredScrollTo = useRef(0)
	const smoothScrollStartedAtTime = useRef(new Date())

	const { reduceAnimations } = useSelector(
		getTimelinePreferences,
		(a, b) => a.reduceAnimations === b.reduceAnimations,
	)

	const scrollTo = useCallback(
		({
			timestamp,
			useRawScroll,
			skipAnim,
		}: {
			timestamp: number
			useRawScroll?: boolean
			skipAnim?: boolean
		}) => {
			if (!containerRef.current) {
				return
			}

			const easing = bezier(0.5, 0, 0.5, 1)
			const targetScroll = (() => {
				if (useRawScroll) {
					return timestamp
				}
				return Math.floor(
					realTimeToScaledTime(-timestamp) + containerRef.current.getBoundingClientRect().width / 2,
				)
			})()

			const isScrollingAlready =
				Math.abs(startedScrollFrom.current) > 0 || Math.abs(desiredScrollTo.current) > 0
			startedScrollFrom.current = scrollRef.current

			let scrollToSet = targetScroll
			if (isFinite(minimumScroll) && scrollToSet < minimumScroll) {
				scrollToSet = minimumScroll
			} else if (isFinite(maximumScroll) && scrollToSet > maximumScroll) {
				scrollToSet = maximumScroll
			}
			desiredScrollTo.current = scrollToSet
			smoothScrollStartedAtTime.current = new Date()

			/**
			 * Already scrolling.
			 * The existing callback will handle the new target.
			 */
			if (isScrollingAlready) {
				return
			}

			const callback = () => {
				const time = Math.min(1, (new Date().getTime() - smoothScrollStartedAtTime.current.getTime()) / 300)
				const bezierPos = easing(time)
				scrollRef.current =
					startedScrollFrom.current + (desiredScrollTo.current - startedScrollFrom.current) * bezierPos
				setScroll(scrollRef.current)
				if (time < 1) {
					requestAnimationFrame(callback)
				} else {
					startedScrollFrom.current = 0
					desiredScrollTo.current = 0
				}
			}

			if (skipAnim || reduceAnimations) {
				scrollRef.current = desiredScrollTo.current
				setScroll(scrollRef.current)
				startedScrollFrom.current = 0
				desiredScrollTo.current = 0
			} else {
				requestAnimationFrame(callback)
			}
		},
		[
			containerRef,
			scrollRef,
			minimumScroll,
			maximumScroll,
			realTimeToScaledTime,
			reduceAnimations,
			setScroll,
		],
	)

	/* External scrollTo */
	useEventBusSubscribe['timeline/requestScrollTo']({
		callback: (props) => {
			if ('rawScrollValue' in props) {
				scrollTo({
					timestamp: props.rawScrollValue,
					useRawScroll: true,
					skipAnim: props.skipAnim,
				})
			} else {
				scrollTo(props)
			}
		},
	})
}
