import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { useTimelineWorldTime } from '@/app/features/time/hooks/useTimelineWorldTime'
import { ScaleLevel } from '@/app/features/world/components/Timeline/types'
import { TimelineState } from '@/app/features/world/components/Timeline/utils/TimelineState'
import { worldSlice } from '@/app/features/world/reducer'
import { getTimelineContextMenuState, getWorldCalendarState } from '@/app/features/world/selectors'
import { LineSpacing } from '@/app/features/world/utils/constants'

type Props = {
	scaleLevel: ScaleLevel
}

export const useTimelineContextMenu = ({ scaleLevel }: Props) => {
	const { isOpen } = useSelector(getTimelineContextMenuState)
	const calendar = useSelector(getWorldCalendarState)
	const { scaledTimeToRealTime } = useTimelineWorldTime({ scaleLevel, calendar })

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
