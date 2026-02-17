import { useCallback, useState } from 'react'
import { useSelector } from 'react-redux'

import { useWorldTime } from '@/app/features/time/hooks/useWorldTime'
import { ScaleLevel } from '@/app/schema/ScaleLevel'
import { binarySearchForClosest } from '@/app/utils/binarySearchForClosest'
import { getTimelineState } from '@/app/views/world/WorldSliceSelectors'

type Props = {
	containerRef: React.RefObject<HTMLDivElement | null>
	scrollRef: React.RefObject<number>
	scaleLevel: ScaleLevel
	scaledTimeToRealTime: (time: number) => number
	onClick: (time: number, trackId: string | undefined) => void
	onDoubleClick: (time: number, trackId: string | undefined) => void
}

export const useTimelineClick = ({
	containerRef,
	scrollRef,
	scaleLevel,
	scaledTimeToRealTime,
	onClick,
	onDoubleClick,
}: Props) => {
	const { parseTime } = useWorldTime()
	const { anchorTimestamps: dividerTimestamps } = useSelector(getTimelineState)

	const [selectedTime, setSelectedTime] = useState<number | null>(null)
	const [lastClickPos, setLastClickPos] = useState<number | null>(null)
	const [lastClickTime, setLastClickTime] = useState<number | null>(null)

	const onTimelineClick = useCallback(
		(event: MouseEvent) => {
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

			const clickOffset = scaledTimeToRealTime(point.x + 40 - scrollRef.current - 2)
			const newSelectedTime = binarySearchForClosest(dividerTimestamps, clickOffset)

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
		[
			containerRef,
			dividerTimestamps,
			lastClickPos,
			lastClickTime,
			onClick,
			onDoubleClick,
			scaledTimeToRealTime,
			scrollRef,
		],
	)

	return {
		selectedTime,
		setSelectedTime,
		onTimelineClick,
	}
}
