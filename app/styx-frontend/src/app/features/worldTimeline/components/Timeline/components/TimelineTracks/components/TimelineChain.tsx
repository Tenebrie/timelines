import Box from '@mui/material/Box'
import { memo, Profiler } from 'react'

import { reportComponentProfile } from '@/app/features/profiling/reportComponentProfile'
import { useTimelineWorldTime } from '@/app/features/time/hooks/useTimelineWorldTime'
import { MarkerType, TimelineEntity } from '@/app/features/worldTimeline/types'

import { TimelineEventHeightPx } from '../hooks/useEventTracks'
import { TimelineChainHover } from './TimelineChainHover'

type Props = {
	entity: TimelineEntity<MarkerType>
	realTimeToScaledTime: ReturnType<typeof useTimelineWorldTime>['realTimeToScaledTime']
}

export const TimelineChainComponent = ({ entity, realTimeToScaledTime }: Props) => {
	const height = TimelineEventHeightPx * entity.markerHeight + 4

	return (
		<Profiler id="TimelineChain" onRender={reportComponentProfile}>
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
		</Profiler>
	)
}

export const TimelineChain = memo(TimelineChainComponent)
