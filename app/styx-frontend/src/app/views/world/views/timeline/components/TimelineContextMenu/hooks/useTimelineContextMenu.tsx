import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { useTimelineWorldTime } from '@/app/features/time/hooks/useTimelineWorldTime'
import { LineSpacing } from '@/app/utils/constants'
import { TimelineState } from '@/app/views/world/views/timeline/utils/TimelineState'
import { worldSlice } from '@/app/views/world/WorldSlice'
import { getTimelineContextMenuState, getTimelineState } from '@/app/views/world/WorldSliceSelectors'

export const useTimelineContextMenu = () => {
	const { isOpen } = useSelector(getTimelineContextMenuState, (a, b) => a.isOpen === b.isOpen)
	const { scaleLevel } = useSelector(getTimelineState, (a, b) => a.scaleLevel === b.scaleLevel)
	const { scaledTimeToRealTime } = useTimelineWorldTime({ scaleLevel })

	const dispatch = useDispatch()
	const { openTimelineContextMenu, closeTimelineContextMenu } = worldSlice.actions

	const onContextMenu = useCallback(
		(event: React.MouseEvent) => {
			if (event.shiftKey || event.button !== 2) {
				return
			}
			if (!TimelineState.canOpenContextMenu) {
				return
			}
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

			const clickOffset = Math.round((point.x - TimelineState.scroll) / LineSpacing) * LineSpacing
			const selectedTime = scaledTimeToRealTime(clickOffset)

			dispatch(
				openTimelineContextMenu({
					mousePos: {
						x: event.clientX + 1,
						y: event.clientY,
					},
					selectedTime,
					selectedEvent: null,
				}),
			)
		},
		[closeTimelineContextMenu, dispatch, isOpen, openTimelineContextMenu, scaledTimeToRealTime],
	)

	return {
		onContextMenu,
	}
}
