import { useCallback, useRef, useState } from 'react'

import { useDragDropBusSubscribe } from '@/app/features/dragDrop/hooks/useDragDropBus'
import { binarySearchForClosest } from '@/app/utils/binarySearchForClosest'

import { TimelineState } from '../utils/TimelineState'

type Props = {
	containerRef: React.RefObject<HTMLDivElement | null>
	scrollRef: React.RefObject<number>
	scaledTimeToRealTime: (time: number) => number
	onClick: (time: number, trackId: string | undefined) => void
	onDoubleClick: (time: number, trackId: string | undefined) => void
}

export const useTimelineClick = ({
	containerRef,
	scrollRef,
	scaledTimeToRealTime,
	onClick,
	onDoubleClick,
}: Props) => {
	const [selectedTime, setSelectedTime] = useState<number | null>(null)
	const [lastClickPos, setLastClickPos] = useState<number | null>(null)
	const [lastClickTime, setLastClickTime] = useState<number | null>(null)

	// Did we receive mouse down?
	const isClickingRef = useRef(false)

	useDragDropBusSubscribe({
		callback: () => {
			isClickingRef.current = false
		},
	})

	const onTimelineClick = useCallback(
		(event: MouseEvent) => {
			if (!isClickingRef.current) {
				return
			}
			if (event.shiftKey || event.ctrlKey || event.metaKey) {
				return
			}
			const isClickBlocked = window.document.body.classList.contains('mouse-busy')
			const isTargetValid =
				event.target === containerRef.current ||
				(event.target instanceof HTMLElement && event.target.classList.contains('allow-timeline-click'))
			if (isClickBlocked || !isTargetValid) {
				return
			}
			const trackId = (() => {
				if (event.target && event.target instanceof HTMLElement && 'trackid' in event.target.dataset) {
					return event.target.dataset.trackid
				}
				return undefined
			})()
			event.stopPropagation()
			event.stopImmediatePropagation()

			const boundingRect = (event.currentTarget as HTMLDivElement).getBoundingClientRect()
			const point = {
				x: event.clientX - boundingRect.left,
				y: event.clientY - boundingRect.top,
			}

			const clickOffset = scaledTimeToRealTime(point.x - scrollRef.current - 2)
			let newSelectedTime = clickOffset
			if (TimelineState.anchorTimestamps.length > 0) {
				newSelectedTime = binarySearchForClosest(TimelineState.anchorTimestamps, clickOffset)
			}

			setSelectedTime(newSelectedTime)

			const currentTime = Date.now()
			if (
				lastClickTime === null ||
				lastClickPos === null ||
				currentTime - lastClickTime > 500 ||
				Math.abs(point.x - lastClickPos) > 3
			) {
				onClick(newSelectedTime, trackId)
				setLastClickPos(point.x)
				setLastClickTime(currentTime)
			} else {
				onDoubleClick(newSelectedTime, trackId)
			}
		},
		[containerRef, lastClickPos, lastClickTime, onClick, onDoubleClick, scaledTimeToRealTime, scrollRef],
	)

	const onMouseDown = useCallback((event: MouseEvent) => {
		if (event.button === 0) {
			isClickingRef.current = true
		} else {
			isClickingRef.current = false
		}
	}, [])

	const onMouseUp = useCallback(() => {
		requestAnimationFrame(() => {
			isClickingRef.current = false
		})
	}, [])

	return {
		selectedTime,
		setSelectedTime,
		onTimelineClick,
		onMouseDown,
		onMouseUp,
	}
}
