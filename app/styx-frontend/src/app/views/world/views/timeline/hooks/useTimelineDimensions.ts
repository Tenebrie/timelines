import throttle from 'lodash.throttle'
import { useEffect, useRef, useState } from 'react'

import { dispatchGlobalEvent, useEventBusDispatch } from '@/app/features/eventBus'

import { TimelineState } from '../utils/TimelineState'

export const useTimelineDimensions = () => {
	const containerRef = useRef<HTMLDivElement | null>(null)
	const [width, setWidth] = useState<number>(window.innerWidth)

	const onTimelineResize = useEventBusDispatch['timeline/onResize']()

	useEffect(() => {
		if (!containerRef.current) {
			return
		}
		const rect = containerRef.current.getBoundingClientRect()
		setWidth(rect.width)

		TimelineState.width = rect.width
		TimelineState.height = rect.height
		onTimelineResize({
			width: rect.width,
			height: rect.height,
		})
	}, [containerRef, onTimelineResize])

	const onResize = useRef(
		throttle(() => {
			if (!containerRef.current) {
				return
			}
			const rect = containerRef.current.getBoundingClientRect()
			setWidth(rect.width)

			TimelineState.width = rect.width
			TimelineState.height = rect.height
			dispatchGlobalEvent['timeline/onResize']({
				width: rect.width,
				height: rect.height,
			})
		}, 10),
	)

	useEffect(() => {
		if (!containerRef.current) {
			return
		}
		const handler = onResize.current
		const container = containerRef.current
		const observer = new ResizeObserver(handler)
		observer.observe(container)
		return () => {
			observer.unobserve(container)
		}
	}, [containerRef])

	return {
		containerRef,
		containerWidth: width,
	}
}
