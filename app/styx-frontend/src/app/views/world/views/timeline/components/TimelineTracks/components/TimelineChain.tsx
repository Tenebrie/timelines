import { MarkerType, TimelineEntity } from '@api/types/types'
import Box from '@mui/material/Box'
import { memo } from 'react'

import { useTimelineWorldTime } from '@/app/features/time/hooks/useTimelineWorldTime'

import { TimelineEventHeightPx } from '../hooks/useEventTracks'
import { TimelineChainHover } from './TimelineChainHover'

type Props = {
	entity: TimelineEntity<MarkerType>
	realTimeToScaledTime: ReturnType<typeof useTimelineWorldTime>['realTimeToScaledTime']
}

export const TimelineChainComponent = ({ entity, realTimeToScaledTime }: Props) => {
	const height = TimelineEventHeightPx * entity.markerHeight + 4

	return (
		<Box
			style={{
				bottom: height,
				left: TimelineEventHeightPx / 2 - 16,
			}}
			sx={{
				pointerEvents: 'none',
				position: 'absolute',
			}}
		>
			<TimelineChainHover entity={entity} realTimeToScaledTime={realTimeToScaledTime} />
		</Box>
	)
}

export const TimelineChain = memo(TimelineChainComponent)
