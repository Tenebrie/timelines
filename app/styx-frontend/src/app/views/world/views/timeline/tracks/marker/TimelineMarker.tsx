import { MarkerType, TimelineEntity } from '@api/types/types'
import Box from '@mui/material/Box'
import { memo } from 'react'

import { useTimelineWorldTime } from '@/app/features/time/hooks/useTimelineWorldTime'

import { useHoveredTimelineMarker } from '../components/HoveredTimelineEvents'
import { TimelineChainPositioner } from './TimelineChainPositioner'
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
	const zIndex = hovered ? 3 : 1

	return (
		<Box
			sx={{
				position: 'absolute',
				zIndex,
				transition: 'z-index 0.3s',
				transitionDelay: hovered ? '0.4s' : '0.15s',
			}}
		>
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
