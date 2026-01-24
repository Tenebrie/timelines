import { useCallback, useState } from 'react'

import { useWorldTime } from '@/app/features/time/hooks/useWorldTime'
import { ScaleLevel } from '@/app/schema/ScaleLevel'
import { LineSpacing } from '@/app/utils/constants'

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
	const { parseTime, pickerToTimestamp } = useWorldTime()

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

			const clickOffset = Math.round((point.x + 40 - scrollRef.current) / LineSpacing) * LineSpacing
			let newSelectedTime = scaledTimeToRealTime(clickOffset)
			// For scaleLevel = 4, round to the nearest month
			if (scaleLevel === 4) {
				const t = parseTime(newSelectedTime)
				if (t.day >= 15) {
					t.monthIndex += 1
				}
				newSelectedTime = pickerToTimestamp({
					day: 0,
					hour: 0,
					minute: 0,
					monthIndex: t.monthIndex,
					year: t.year,
				})
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
		[
			containerRef,
			lastClickPos,
			lastClickTime,
			onClick,
			onDoubleClick,
			parseTime,
			pickerToTimestamp,
			scaleLevel,
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
