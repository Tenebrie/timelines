import { MarkerType, TimelineEntity } from '@api/types/types'
import Box from '@mui/material/Box'
import { CSSProperties, memo, useRef } from 'react'

import { useEventBusSubscribe } from '@/app/features/eventBus'
import { useTimelineWorldTime } from '@/app/features/time/hooks/useTimelineWorldTime'
import { TimelineState } from '@/app/views/world/views/timeline/utils/TimelineState'

import { useHoveredTimelineMarker } from '../components/HoveredTimelineEvents'
import { TimelineChain } from './TimelineChain'

type Props = {
	entity: TimelineEntity<MarkerType>
	visible: boolean
	realTimeToScaledTime: ReturnType<typeof useTimelineWorldTime>['realTimeToScaledTime']
}

export const TimelineChainPositionerComponent = ({ entity, visible, realTimeToScaledTime }: Props) => {
	const ref = useRef<HTMLDivElement | null>(null)
	const position = realTimeToScaledTime(Math.floor(entity.markerPosition)) + TimelineState.scroll

	const { hovered } = useHoveredTimelineMarker(entity)
	const chainVisible = entity.markerType === 'issuedAt' || entity.markerType === 'deltaState' || hovered

	useEventBusSubscribe({
		event: 'timelineScrolled',
		callback: (newScroll) => {
			if (!chainVisible) {
				return
			}
			const pos = realTimeToScaledTime(Math.floor(entity.markerPosition)) + newScroll
			if (ref.current && ref.current.style.getPropertyValue('--position') !== `${pos}px`) {
				ref.current.style.setProperty('--position', `${pos}px`)
			}
		},
	})

	return (
		<Box
			ref={ref}
			style={
				{
					'--position': `${position}px`,
					'--opacity': visible ? 1 : 0,
				} as CSSProperties
			}
			sx={{
				transform: 'translateX(var(--position))',
				opacity: 'var(--opacity)',
				position: 'absolute',
				transition: 'opacity 0.3s',
				pointerEvents: 'none',
			}}
		>
			<TimelineChain entity={entity} realTimeToScaledTime={realTimeToScaledTime} />
		</Box>
	)
}

export const TimelineChainPositioner = memo(TimelineChainPositionerComponent)
