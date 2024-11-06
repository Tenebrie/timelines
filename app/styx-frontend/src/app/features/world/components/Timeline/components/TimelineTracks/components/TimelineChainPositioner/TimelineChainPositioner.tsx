import { memo } from 'react'

import { useTimelineWorldTime } from '../../../../../../../time/hooks/useTimelineWorldTime'
import { MarkerType, TimelineEntity } from '../../../../../../types'
import { Chain } from '../../styles'
import { TimelineChain } from '../TimelineChain/TimelineChain'

type Props = {
	entity: TimelineEntity<MarkerType>
	scroll: number
	lineSpacing: number
	timelineScale: number
	visible: boolean
	containerWidth: number
	highlighted: boolean
	realTimeToScaledTime: ReturnType<typeof useTimelineWorldTime>['realTimeToScaledTime']
}

const TimelineChainPositionerComponent = ({
	entity,
	scroll,
	lineSpacing,
	timelineScale,
	visible,
	containerWidth,
	highlighted,
	realTimeToScaledTime,
}: Props) => {
	const position = realTimeToScaledTime(Math.floor(entity.markerPosition) / timelineScale) + scroll

	if (position < -30 || position > containerWidth + 30) {
		return null
	}

	return (
		<Chain $position={position} className={`${visible ? 'visible' : ''}`}>
			<TimelineChain entity={entity} highlighted={highlighted} />
		</Chain>
	)
}

export const TimelineChainPositioner = memo(TimelineChainPositionerComponent)
