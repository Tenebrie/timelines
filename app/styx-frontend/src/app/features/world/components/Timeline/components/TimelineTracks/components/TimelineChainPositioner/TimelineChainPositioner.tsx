import { memo, useRef } from 'react'

import { useTimelineWorldTime } from '@/app/features/time/hooks/useTimelineWorldTime'
import { MarkerType, TimelineEntity } from '@/app/features/world/types'

import { useMarkerScroll } from '../../hooks/useMarkerScroll'
import { Chain } from '../../styles'
import { TimelineChain } from '../TimelineChain/TimelineChain'

type Props = {
	entity: TimelineEntity<MarkerType>
	visible: boolean
	edited: boolean
	selected: boolean
	realTimeToScaledTime: ReturnType<typeof useTimelineWorldTime>['realTimeToScaledTime']
}

export const TimelineChainPositionerComponent = ({
	entity,
	visible,
	edited,
	selected,
	realTimeToScaledTime,
}: Props) => {
	const position = realTimeToScaledTime(Math.floor(entity.markerPosition))
	const ref = useRef<HTMLDivElement | null>(null)
	useMarkerScroll({ ref })

	return (
		<Chain ref={ref} $position={position} className={`${visible ? 'visible' : ''} timeline-marker-scroll`}>
			<TimelineChain
				entity={entity}
				edited={edited}
				selected={selected}
				realTimeToScaledTime={realTimeToScaledTime}
			/>
		</Chain>
	)
}

export const TimelineChainPositioner = memo(TimelineChainPositionerComponent)
