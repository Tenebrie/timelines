import { useState } from 'react'

import { HoveredTimelineEvents } from '../TimelineTracks/components/TimelineEvent/HoveredTimelineEvents'
import { Container } from './styles'

type Props = {
	side: 'left' | 'right'
	onClick: () => void
}

export const TimelineEdgeScroll = ({ side, onClick }: Props) => {
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
