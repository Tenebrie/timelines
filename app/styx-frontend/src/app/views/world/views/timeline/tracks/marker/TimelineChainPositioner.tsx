import { MarkerType, TimelineEntity } from '@api/types/worldTypes'
import Box from '@mui/material/Box'
import { CSSProperties, memo, useCallback, useRef } from 'react'

import { useEventBusSubscribe } from '@/app/features/eventBus'
import { useTimelineWorldTime } from '@/app/features/time/hooks/useTimelineWorldTime'
import { TimelineState } from '@/app/views/world/views/timeline/utils/TimelineState'

import { TimelineEventHeightPx } from '../../hooks/useEventTracks'
import { CONTROLLED_SCROLLER_SIZE, EVENT_SCROLL_RESET_PERIOD } from '../components/ControlledScroller'
import { useHoveredTimelineMarker } from '../components/HoveredTimelineEvents'
import { TimelineChain } from './TimelineChain'

type Props = {
	entity: TimelineEntity<MarkerType>
	visible: boolean
	realTimeToScaledTime: ReturnType<typeof useTimelineWorldTime>['realTimeToScaledTime']
}

export const TimelineChainPositioner = memo(TimelineChainPositionerComponent)

export function TimelineChainPositionerComponent({ entity, visible, realTimeToScaledTime }: Props) {
	const ref = useRef<HTMLDivElement | null>(null)

	const calculatePosition = useCallback(
		(scroll: number) => {
			const pos = realTimeToScaledTime(Math.floor(entity.markerPosition))
			return (
				pos +
				Math.floor(scroll / EVENT_SCROLL_RESET_PERIOD) * EVENT_SCROLL_RESET_PERIOD +
				CONTROLLED_SCROLLER_SIZE -
				TimelineEventHeightPx
			)
		},
		[entity.markerPosition, realTimeToScaledTime],
	)
	const position = calculatePosition(TimelineState.scroll)

	const { hovered } = useHoveredTimelineMarker(entity)
	const chainVisible = entity.markerType === 'issuedAt' || entity.markerType === 'deltaState' || hovered

	useEventBusSubscribe['timeline/onScroll']({
		callback: (newScroll) => {
			if (!chainVisible) {
				return
			}
			const fixedPos = calculatePosition(newScroll)
			if (ref.current && ref.current.style.getPropertyValue('--position') !== `${fixedPos}px`) {
				ref.current.style.setProperty('--position', `${fixedPos}px`)
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
				bottom: '0',
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
