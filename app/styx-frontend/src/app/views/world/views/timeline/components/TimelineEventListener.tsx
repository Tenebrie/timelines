import { useCallback } from 'react'
import { useSelector } from 'react-redux'

import { useEventBusDispatch, useEventBusSubscribe } from '@/app/features/eventBus'
import { useTimelineWorldTime } from '@/app/features/time/hooks/useTimelineWorldTime'
import { getTimelineState, getWorldState } from '@/app/views/world/WorldSliceSelectors'

import { TimelineState } from '../utils/TimelineState'

type Props = {
	containerWidth: number
}

export function TimelineEventListener({ containerWidth }: Props) {
	const scrollTimelineTo = useEventBusDispatch({ event: 'scrollTimelineTo' })
	const { calendar } = useSelector(getWorldState, (a, b) => a.calendar === b.calendar)
	const { scaleLevel } = useSelector(getTimelineState, (a, b) => a.scaleLevel === b.scaleLevel)

	const { scaledTimeToRealTime } = useTimelineWorldTime({ scaleLevel, calendar })
	const onScrollFullPage = useCallback(
		(side: 'left' | 'right') => {
			const currentTimestamp = scaledTimeToRealTime(-TimelineState.scroll)
			const sideScalar = side === 'left' ? -1 : 1
			scrollTimelineTo({
				timestamp: currentTimestamp + scaledTimeToRealTime(containerWidth * sideScalar + containerWidth / 2),
			})
		},
		[scaledTimeToRealTime, scrollTimelineTo, containerWidth],
	)
	useEventBusSubscribe({ event: 'scrollTimelineLeft', callback: () => onScrollFullPage('left') })
	useEventBusSubscribe({ event: 'scrollTimelineRight', callback: () => onScrollFullPage('right') })

	return null
}
