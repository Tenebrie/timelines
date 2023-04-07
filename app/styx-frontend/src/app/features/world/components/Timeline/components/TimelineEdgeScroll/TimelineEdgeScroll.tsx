import { useCallback, useState } from 'react'

import { useTimelineWorldTime } from '../../../../../time/hooks/useTimelineWorldTime'
import { ScaleLevel } from '../../types'
import { HoveredTimelineEvents } from '../TimelineEventGroup/components/TimelineEvent/HoveredTimelineEvents'
import { Container } from './styles'

type Props = {
	side: 'left' | 'right'
	currentScroll: number
	pageSize: number
	timelineScale: number
	scaleLevel: ScaleLevel
	scrollTo: (timestamp: number) => void
}

export const TimelineEdgeScroll = ({
	side,
	currentScroll,
	pageSize,
	timelineScale,
	scaleLevel,
	scrollTo,
}: Props) => {
	const { scaledTimeToRealTime } = useTimelineWorldTime({ scaleLevel })

	const onClick = useCallback(() => {
		const currentTimestamp = scaledTimeToRealTime(-currentScroll * timelineScale)
		const sideScalar = side === 'left' ? -1 : 1
		scrollTo(currentTimestamp + scaledTimeToRealTime((pageSize * sideScalar + pageSize / 2) * timelineScale))
	}, [currentScroll, pageSize, scaledTimeToRealTime, scrollTo, side, timelineScale])

	const [hovered, setHovered] = useState(false)

	const onMouseEnter = () => {
		setHovered(true)
		HoveredTimelineEvents.hoverEdgeScroller(side)
	}

	const onMouseLeave = () => {
		setHovered(false)
		HoveredTimelineEvents.unhoverEdgeScroller(side)
	}

	return (
		<Container
			className={`${side} ${hovered ? 'hovered' : ''}`}
			onMouseEnter={onMouseEnter}
			onMouseLeave={onMouseLeave}
			onClick={onClick}
		/>
	)
}
