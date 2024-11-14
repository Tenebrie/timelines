import { Typography } from '@mui/material'
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
	const dist =
		realTimeToScaledTime(entity.nextEntity.markerPosition - entity.markerPosition) - TimelineEventHeightPx - 2
	const height = TimelineEventHeightPx * entity.markerHeight + 4
	const color = getStringColor(entity.eventId)

	return (
		<div
			style={{
				pointerEvents: 'none',
				position: 'absolute',
				bottom: height,
				left: TimelineEventHeightPx / 2 - 1,
			}}
		>
			<div
				style={{
					width: dist,
					height: TimelineEventHeightPx - 12,
					background: 'rgb(255 255 255 / 10%)',
					borderTop: `2px solid ${color}`,
					display: 'flex',
					alignItems: 'center',
					paddingLeft: 4,
					paddingRight: 0,
				}}
			>
				<Typography variant="caption" fontWeight={800} noWrap style={{ width: 'calc(100% - 8px)' }}>
					{entity.name}
				</Typography>
			</div>
		</div>
	)
}

export const TimelineChain = memo(TimelineChainComponent)
