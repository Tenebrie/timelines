import { memo } from 'react'

import { useTimelineWorldTime } from '../../../../../../../time/hooks/useTimelineWorldTime'
import { MarkerType, TimelineEntity } from '../../../../../../types'
import { Chain } from '../../styles'
import { TimelineChain } from '../TimelineChain/TimelineChain'

type Props = {
	entity: TimelineEntity<MarkerType>
	timelineScale: number
	visible: boolean
	highlighted: boolean
	realTimeToScaledTime: ReturnType<typeof useTimelineWorldTime>['realTimeToScaledTime']
}

export const TimelineChainPositionerComponent = ({
	entity,
	timelineScale,
	visible,
	highlighted,
	realTimeToScaledTime,
}: Props) => {
	const position = realTimeToScaledTime(Math.floor(entity.markerPosition) / timelineScale)

	return (
		<Chain $position={position} className={`${visible ? 'visible' : ''}`}>
			<TimelineChain
				entity={entity}
				timelineScale={timelineScale}
				highlighted={highlighted}
				realTimeToScaledTime={realTimeToScaledTime}
			/>
		</Chain>
	)
}

export const TimelineChainPositioner = memo(TimelineChainPositionerComponent)
