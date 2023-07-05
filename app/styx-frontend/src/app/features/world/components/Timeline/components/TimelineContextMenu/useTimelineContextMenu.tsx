import { useCallback, useState } from 'react'

import { useTimelineWorldTime } from '../../../../../time/hooks/useTimelineWorldTime'
import { ScaleLevel } from '../../types'

type Props = {
	scroll: number
	timelineScale: number
	scaleLevel: ScaleLevel
}

export const useTimelineContextMenu = ({ scroll, timelineScale, scaleLevel }: Props) => {
	const [open, setOpen] = useState(false)
	const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
	const [selectedTime, setSelectedTime] = useState<number>(0)

	const { scaledTimeToRealTime } = useTimelineWorldTime({ scaleLevel })

	const onContextMenu = useCallback(
		(event: React.MouseEvent) => {
			event.preventDefault()
			if (open) {
				setOpen(false)
				return
			}

			const boundingRect = (event.currentTarget as HTMLDivElement).getBoundingClientRect()
			const point = {
				x: event.clientX - boundingRect.left,
				y: event.clientY - boundingRect.top,
			}

			const roundToX = 10 / timelineScale
			const clickOffset = Math.round((point.x - scroll) / roundToX) * roundToX * timelineScale
			const selectedTime = scaledTimeToRealTime(clickOffset)

			setOpen(true)
			setMousePos({
				x: event.clientX + 1,
				y: event.clientY,
			})
			setSelectedTime(selectedTime)
		},
		[open, scaledTimeToRealTime, scroll, timelineScale]
	)

	const onClose = useCallback(() => {
		setOpen(false)
	}, [])

	return {
		onContextMenu,
		onClose,
		state: {
			open,
			mousePos,
			onClose,
			selectedTime,
		},
	}
}
