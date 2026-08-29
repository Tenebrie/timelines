import { useCallback } from 'react'
import { useSelector } from 'react-redux'

import { useEventBusDispatch, useEventBusSubscribe } from '@/app/features/eventBus'
import { useTimelineWorldTime } from '@/app/features/time/hooks/useTimelineWorldTime'
import { Shortcut, useShortcut } from '@/app/hooks/useShortcut/useShortcut'
import { getTimelineState } from '@/app/views/world/WorldSliceSelectors'

import { TimelineState } from '../utils/TimelineState'

type Props = {
	containerWidth: number
}

export function TimelineEventListener({ containerWidth }: Props) {
	const scrollTimelineTo = useEventBusDispatch['timeline/requestScrollTo']()
	const { scaleLevel } = useSelector(getTimelineState, (a, b) => a.scaleLevel === b.scaleLevel)

	const { scaledTimeToRealTime } = useTimelineWorldTime({ scaleLevel })
	const onScrollFullPage = useCallback(
		(side: 'left' | 'right') => {
			const currentTimestamp = scaledTimeToRealTime(-TimelineState.scroll)
			const sideScalar = side === 'left' ? -1 : 1
			scrollTimelineTo({
				timestamp:
					currentTimestamp + scaledTimeToRealTime((containerWidth / 2) * sideScalar + containerWidth / 2),
			})
		},
		[scaledTimeToRealTime, scrollTimelineTo, containerWidth],
	)
	useEventBusSubscribe['timeline/requestScrollLeft']({ callback: () => onScrollFullPage('left') })
	useEventBusSubscribe['timeline/requestScrollRight']({ callback: () => onScrollFullPage('right') })

	useShortcut(Shortcut.ScrollTimelineLeft, () => onScrollFullPage('left'))
	useShortcut(Shortcut.ScrollTimelineRight, () => onScrollFullPage('right'))

	return null
}
