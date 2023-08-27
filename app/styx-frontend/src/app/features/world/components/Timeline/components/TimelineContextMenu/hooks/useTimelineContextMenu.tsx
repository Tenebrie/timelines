import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { getTimelinePreferences } from '../../../../../../preferences/selectors'
import { useTimelineWorldTime } from '../../../../../../time/hooks/useTimelineWorldTime'
import { worldSlice } from '../../../../../reducer'
import { getTimelineContextMenuState } from '../../../../../selectors'
import { ScaleLevel } from '../../../types'

type Props = {
	scroll: number
	timelineScale: number
	scaleLevel: ScaleLevel
}

export const useTimelineContextMenu = ({ scroll, timelineScale, scaleLevel }: Props) => {
	const { isOpen } = useSelector(getTimelineContextMenuState)
	const { lineSpacing } = useSelector(getTimelinePreferences)
	const { scaledTimeToRealTime } = useTimelineWorldTime({ scaleLevel })

	const dispatch = useDispatch()
	const { openTimelineContextMenu, closeTimelineContextMenu } = worldSlice.actions

	const onContextMenu = useCallback(
		(event: React.MouseEvent) => {
			event.preventDefault()
			if (isOpen) {
				dispatch(closeTimelineContextMenu())
				return
			}

			const boundingRect = (event.currentTarget as HTMLDivElement).getBoundingClientRect()
			const point = {
				x: event.clientX - boundingRect.left,
				y: event.clientY - boundingRect.top,
			}

			const roundToX = lineSpacing / timelineScale
			const clickOffset = Math.round((point.x - scroll) / roundToX) * roundToX * timelineScale
			const selectedTime = scaledTimeToRealTime(clickOffset)

			dispatch(
				openTimelineContextMenu({
					mousePos: {
						x: event.clientX + 1,
						y: event.clientY,
					},
					selectedTime,
					selectedEvent: null,
				})
			)
		},
		[
			closeTimelineContextMenu,
			dispatch,
			isOpen,
			lineSpacing,
			openTimelineContextMenu,
			scaledTimeToRealTime,
			scroll,
			timelineScale,
		]
	)

	return {
		onContextMenu,
	}
}
