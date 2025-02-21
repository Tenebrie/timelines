import Stack from '@mui/material/Stack'
import { CSSProperties, memo, useRef } from 'react'

import { useEventBusSubscribe } from '@/app/features/eventBus'
import { useTimelineWorldTime } from '@/app/features/time/hooks/useTimelineWorldTime'
import { TimelineState } from '@/app/features/worldTimeline/components/Timeline/utils/TimelineState'
import { MarkerType, TimelineEntity } from '@/app/features/worldTimeline/types'

import { TimelineChain } from './TimelineChain'

type Props = {
	entity: TimelineEntity<MarkerType>
	visible: boolean
	realTimeToScaledTime: ReturnType<typeof useTimelineWorldTime>['realTimeToScaledTime']
}

export const TimelineChainPositionerComponent = ({ entity, visible, realTimeToScaledTime }: Props) => {
	const ref = useRef<HTMLDivElement | null>(null)
	const position = realTimeToScaledTime(Math.floor(entity.markerPosition)) + TimelineState.scroll

	useEventBusSubscribe({
		event: 'timelineScrolled',
		callback: () => {
			const pos = realTimeToScaledTime(Math.floor(entity.markerPosition)) + TimelineState.scroll
			if (ref.current && ref.current.style.getPropertyValue('--position') !== `${pos}px`) {
				ref.current?.style.setProperty('--position', `${pos}px`)
			}
		},
	})

	return (
		<Stack
			ref={ref}
			className="timeline-marker-scroll"
			style={
				{
					'--position': `${position}px`,
					'--opacity': visible ? 1 : 0,
				} as CSSProperties
			}
			sx={{
				left: 'var(--position)',
				opacity: 'var(--opacity)',
				position: 'absolute',
				transition: 'opacity 0.3s',
				pointerEvents: 'none',
			}}
		>
			<TimelineChain entity={entity} realTimeToScaledTime={realTimeToScaledTime} />
		</Stack>
	)
}

// export const Chain = styled.div.attrs<{ $position: number }>((props) => ({
// 	style: {
// 		left: `calc(${props.$position}px`,
// 	},
// }))<{ $position: number }>`
// 	display: flex;
// 	position: absolute;
// 	opacity: 0;
// 	transition: opacity 0.3s;
// 	pointer-events: none;

// 	&.visible {
// 		opacity: 1;
// 	}
// `

export const TimelineChainPositioner = memo(TimelineChainPositionerComponent)
