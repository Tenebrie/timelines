import { MarkerType, TimelineEntity } from '@api/types/worldTypes'
import Box from '@mui/material/Box'
import { CSSProperties, memo, useCallback, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'

import { useEventBusSubscribe } from '@/app/features/eventBus'
import { useTimelineWorldTime } from '@/app/features/time/hooks/useTimelineWorldTime'
import { TimelineState } from '@/app/views/world/views/timeline/utils/TimelineState'
import { getTimelineState } from '@/app/views/world/WorldSliceSelectors'

import { TimelineEventHeightPx } from '../../hooks/useEventTracks'
import { CONTROLLED_SCROLLER_SIZE, EVENT_SCROLL_RESET_PERIOD } from '../components/ControlledScroller'
import { useHoveredTimelineMarker } from '../components/HoveredTimelineEvents'
import { TimelineChainBody } from './TimelineChainBody'

type Props = {
	entity: TimelineEntity<MarkerType>
	visible: boolean
	realTimeToScaledTime: ReturnType<typeof useTimelineWorldTime>['realTimeToScaledTime']
}

export const TimelineChain = memo(TimelineChainComponent)

export function TimelineChainComponent({ entity, visible, realTimeToScaledTime }: Props) {
	const ref = useRef<HTMLDivElement | null>(null)
	const { scaleLevel } = useSelector(getTimelineState, (a, b) => a.scaleLevel === b.scaleLevel)
	const { scaledTimeToRealTime } = useTimelineWorldTime({ scaleLevel })

	const positionChecked = useRef(0)

	const calculatePosition = useCallback(
		(scroll: number) => {
			if (!entity.chainEntity) {
				return {
					pos: 0,
					dist: 0,
					align: 'left' as const,
				}
			}

			const screenLeft = -scroll - 5000
			const screenRight = -scroll + 15000

			const distToLeft = Math.abs(scaledTimeToRealTime(-scroll) - entity.markerPosition)
			const distToRight = Math.abs(scaledTimeToRealTime(-scroll) - entity.chainEntity.markerPosition)

			const scrollNormalizer =
				Math.floor(scroll / EVENT_SCROLL_RESET_PERIOD) * EVENT_SCROLL_RESET_PERIOD +
				CONTROLLED_SCROLLER_SIZE -
				TimelineEventHeightPx

			const pos = Math.max(realTimeToScaledTime(entity.markerPosition), screenLeft)
			const leftEdge = pos + scrollNormalizer

			const chainPos = Math.min(realTimeToScaledTime(entity.chainEntity.markerPosition), screenRight)
			const rightEdge = chainPos + scrollNormalizer

			if (distToLeft < distToRight) {
				return {
					pos: leftEdge,
					dist: Math.abs(rightEdge - leftEdge),
					align: 'left' as const,
				}
			} else {
				return {
					pos: rightEdge,
					dist: Math.abs(rightEdge - leftEdge),
					align: 'right' as const,
				}
			}
		},
		[entity.chainEntity, entity.markerPosition, realTimeToScaledTime, scaledTimeToRealTime],
	)
	const position = calculatePosition(TimelineState.scroll)

	const { hovered } = useHoveredTimelineMarker(entity)
	const chainVisible = entity.markerType === 'issuedAt' || entity.markerType === 'deltaState' || hovered

	const updatePositions = useCallback(
		(scroll: number) => {
			if (!chainVisible || !ref.current) {
				return
			}

			const { pos, dist, align } = calculatePosition(scroll)
			if (dist === 0) {
				return
			}

			const alignOffset = align === 'left' ? '0px' : '-100%'
			const posValue = `${pos}px`
			const distValue = `${dist}px`

			// Batch reads
			const posChanged = ref.current.style.getPropertyValue('--position') !== posValue
			const distChanged = ref.current.style.getPropertyValue('--anchor-length') !== distValue
			const alignChanged = ref.current.style.getPropertyValue('--align-offset') !== alignOffset

			// Batch writes
			if (posChanged) ref.current.style.setProperty('--position', posValue)
			if (distChanged) ref.current.style.setProperty('--anchor-length', distValue)
			if (alignChanged) ref.current.style.setProperty('--align-offset', alignOffset)
		},
		[calculatePosition, chainVisible],
	)

	useEventBusSubscribe['timeline/onScroll']({
		callback: (scroll) => {
			if (Math.abs(scroll - positionChecked.current) < 1000) {
				return
			}
			positionChecked.current = scroll
			updatePositions(scroll)
		},
	})

	useEventBusSubscribe['timeline/pips/forceUpdate']({
		callback: () => {
			updatePositions(TimelineState.scroll)
		},
	})

	useEffect(() => {
		updatePositions(TimelineState.scroll)
	}, [updatePositions])

	return (
		<Box
			ref={ref}
			style={
				{
					'--position': `${position.pos}px`,
					'--align-offset': '0px',
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
			<TimelineChainBody entity={entity} />
		</Box>
	)
}
