import { MouseEvent, useRef, useState } from 'react'

import { TimelineEventGroup } from '../TimelineEventGroup/TimelineEventGroup'
import useEventGroups from './hooks/useEventGroups'
import { TimelineContainer } from './styles'
import TimelineAnchor from './TimelineAnchor'

export const Timeline = () => {
	const eventGroups = useEventGroups()

	const [scroll, setScroll] = useState(150)
	const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
	const [isDragging, setDragging] = useState(false)
	const onMouseDown = () => {
		setDragging(true)
	}

	const onMouseUp = () => {
		setDragging(false)
	}

	const onMouseMove = (event: MouseEvent<HTMLDivElement>) => {
		const boundingRect = event.currentTarget.getBoundingClientRect()
		const newPos = { x: event.screenX - boundingRect.left, y: event.screenY - boundingRect.top }

		if (isDragging) {
			setScroll(scroll + newPos.x - mousePos.x)
		}
		setMousePos(newPos)
	}

	const containerRef = useRef<HTMLDivElement | null>(null)

	return (
		<TimelineContainer
			ref={containerRef}
			onMouseDown={onMouseDown}
			onMouseUp={onMouseUp}
			onMouseLeave={onMouseUp}
			onMouseMove={onMouseMove}
		>
			<TimelineAnchor offset={scroll} />
			{eventGroups.map((group) => (
				<TimelineEventGroup key={group.timestamp} eventGroup={group} scroll={scroll} />
			))}
		</TimelineContainer>
	)
}
