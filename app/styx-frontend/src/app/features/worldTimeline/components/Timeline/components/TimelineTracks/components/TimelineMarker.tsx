import Box from '@mui/material/Box'
import { memo } from 'react'

import { useTimelineWorldTime } from '@/app/features/time/hooks/useTimelineWorldTime'
import { MarkerType, TimelineEntity } from '@/app/features/worldTimeline/types'

import { TimelineChainPositioner } from './TimelineChainPositioner'
import { useHoveredTimelineMarker } from './TimelineEvent/HoveredTimelineEvents'
import { TimelineEventPositioner } from './TimelineEventPositioner'

type Props = {
	marker: TimelineEntity<MarkerType>
	visible: boolean
	selected: boolean
	trackHeight: number
	realTimeToScaledTime: ReturnType<typeof useTimelineWorldTime>['realTimeToScaledTime']
}

export const TimelineMarker = memo(TimelineMarkerComponent)

export function TimelineMarkerComponent({
	marker,
	visible,
	selected,
	trackHeight,
	realTimeToScaledTime,
}: Props) {
	const { hovered } = useHoveredTimelineMarker(marker)

	return (
		<Box sx={{ zIndex: hovered ? 2 : 1 }}>
			<TimelineChainPositioner
				entity={marker}
				visible={visible}
				realTimeToScaledTime={realTimeToScaledTime}
			/>
			<TimelineEventPositioner
				entity={marker}
				visible={visible}
				selected={selected}
				trackHeight={trackHeight}
				realTimeToScaledTime={realTimeToScaledTime}
			/>
		</Box>
	)
}
