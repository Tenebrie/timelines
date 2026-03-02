import { MarkerType, TimelineEntity } from '@api/types/worldTypes'
import Box from '@mui/material/Box'
import { memo } from 'react'

import { useTimelineWorldTime } from '@/app/features/time/hooks/useTimelineWorldTime'

import { useHoveredTimelineMarker } from '../components/HoveredTimelineEvents'
import { TimelineChain } from './TimelineChain'
import { TimelineMarker } from './TimelineMarker'

type Props = {
	marker: TimelineEntity<MarkerType>
	visible: boolean
	selected: boolean
	trackHeight: number
	realTimeToScaledTime: ReturnType<typeof useTimelineWorldTime>['realTimeToScaledTime']
}

export const TimelineMarkerWithChain = memo(TimelineMarkerWithChainComponent)

export function TimelineMarkerWithChainComponent({
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
				zIndex,
				transition: 'z-index 0.3s',
				transitionDelay: hovered ? '0.4s' : '0.15s',
			}}
		>
			<TimelineChain entity={marker} visible={visible} realTimeToScaledTime={realTimeToScaledTime} />
			<TimelineMarker
				entity={marker}
				visible={visible}
				selected={selected}
				trackHeight={trackHeight}
				realTimeToScaledTime={realTimeToScaledTime}
			/>
		</Box>
	)
}
