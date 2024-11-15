import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { getTimelinePreferences } from '@/app/features/preferences/selectors'
import { useTimelineWorldTime } from '@/app/features/time/hooks/useTimelineWorldTime'
import { ScaleLevel } from '@/app/features/world/components/Timeline/types'
import { worldSlice } from '@/app/features/world/reducer'
import { getTimelineContextMenuState } from '@/app/features/world/selectors'

type Props = {
	scroll: number
	scaleLevel: ScaleLevel
}

export const useTimelineContextMenu = ({ scroll, scaleLevel }: Props) => {
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

			const clickOffset = Math.round((point.x - scroll) / lineSpacing) * lineSpacing
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
		[
			closeTimelineContextMenu,
			dispatch,
			isOpen,
			lineSpacing,
			openTimelineContextMenu,
			scaledTimeToRealTime,
			scroll,
		],
	)

	return {
		onContextMenu,
	}
}
