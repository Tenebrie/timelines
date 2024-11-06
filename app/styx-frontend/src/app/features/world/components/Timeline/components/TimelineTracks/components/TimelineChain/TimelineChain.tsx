import { memo } from 'react'

import { hashCode } from '../../../../../../../../utils/hashCode'
import { useTimelineWorldTime } from '../../../../../../../time/hooks/useTimelineWorldTime'
import { MarkerType, TimelineEntity } from '../../../../../../types'

type Props = {
	entity: TimelineEntity<MarkerType>
	timelineScale: number
	highlighted: boolean
	realTimeToScaledTime: ReturnType<typeof useTimelineWorldTime>['realTimeToScaledTime']
}

export const TimelineChainComponent = ({
	entity,
	timelineScale,
	highlighted,
	realTimeToScaledTime,
}: Props) => {
	if (!entity.nextEntity) {
		return
	}
	const padding = 10
	const dist =
		realTimeToScaledTime(entity.nextEntity.markerPosition - entity.markerPosition + padding - 7) /
		timelineScale
	const height = -Math.min(dist / 10, 45)
	const color = hashCode(entity.eventId) % 2 === 0 ? 'rgb(255, 200, 200)' : 'rgb(200, 255, 200)'

	return (
		<div style={{ pointerEvents: 'none', position: 'absolute', top: -8 - padding - 75, left: 4 - padding }}>
			<svg width={dist + padding} height="100" viewBox={`0 -75 ${dist + padding} 100`}>
				<path
					d={`M ${padding - 5} ${padding + 5} C ${dist * 0.1} ${height + padding}, ${dist * 0.9} ${height + padding}, ${dist + 5} ${padding + 5}`}
					stroke={color}
					strokeWidth={3}
					fill="transparent"
				/>
			</svg>
		</div>
	)
}

export const TimelineChain = memo(TimelineChainComponent)
