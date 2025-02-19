import { memo, useRef } from 'react'

import { useEventBusSubscribe } from '@/app/features/eventBus'
import { useTimelineWorldTime } from '@/app/features/time/hooks/useTimelineWorldTime'
import { TimelineState } from '@/app/features/worldTimeline/components/Timeline/utils/TimelineState'
import { MarkerType, TimelineEntity } from '@/app/features/worldTimeline/types'

import { Chain } from '../styles'
import { TimelineChain } from './TimelineChain'

type Props = {
	entity: TimelineEntity<MarkerType>
	visible: boolean
	realTimeToScaledTime: ReturnType<typeof useTimelineWorldTime>['realTimeToScaledTime']
}

export const TimelineChainPositionerComponent = ({ entity, visible, realTimeToScaledTime }: Props) => {
	const ref = useRef<HTMLDivElement | null>(null)
	const position = realTimeToScaledTime(Math.floor(entity.markerPosition)) + TimelineState.scroll

	useEventBusSubscribe({
		event: 'timelineScrolled',
		callback: () => {
			const pos = realTimeToScaledTime(Math.floor(entity.markerPosition)) + TimelineState.scroll

			if (ref.current) {
				ref.current.style.left = `${pos}px`
			}
		},
	})

	return (
		<Chain ref={ref} $position={position} className={`${visible ? 'visible' : ''} timeline-marker-scroll`}>
			<TimelineChain entity={entity} realTimeToScaledTime={realTimeToScaledTime} />
		</Chain>
	)
}

export const TimelineChainPositioner = memo(TimelineChainPositionerComponent)
