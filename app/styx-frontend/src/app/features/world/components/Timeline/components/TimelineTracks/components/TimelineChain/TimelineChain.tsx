import { memo } from 'react'

import { useStringColor } from '../../../../../../../../utils/getStringColor'
import { useTimelineWorldTime } from '../../../../../../../time/hooks/useTimelineWorldTime'
import { MarkerType, TimelineEntity } from '../../../../../../types'
import { TimelineEventHeightPx } from '../../hooks/useEventTracks'

type Props = {
	entity: TimelineEntity<MarkerType>
	edited: boolean
	selected: boolean
	realTimeToScaledTime: ReturnType<typeof useTimelineWorldTime>['realTimeToScaledTime']
}

export const TimelineChainComponent = ({ entity, edited, selected, realTimeToScaledTime }: Props) => {
	const { getStringColor } = useStringColor()
	if (!entity.nextEntity) {
		return
	}
	const padding = 0
	const dist = realTimeToScaledTime(entity.nextEntity.markerPosition - entity.markerPosition + padding)
	const height = TimelineEventHeightPx * entity.markerHeight + 7
	const color = getStringColor(entity.eventId)

	return (
		<div style={{ pointerEvents: 'none', position: 'absolute', bottom: height, left: 0 }}>
			<div
				style={{
					width: dist + padding,
					height: 12,
					background: 'rgb(255 255 255 / 10%)',
					outline: `2px solid ${color}`,
				}}
			></div>
		</div>
	)
}

export const TimelineChain = memo(TimelineChainComponent)
