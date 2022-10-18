import React, { MouseEvent, useRef, useState } from 'react'
import { useSelector } from 'react-redux'

import { getWorldState } from '../../selectors'
import { TimelineEvent } from '../TimelineEvent/TimelineEvent'
import { TimelineContainer } from './styles'
import TimelineAnchor from './TimelineAnchor'

export const Timeline = () => {
	const { events: storyEvents } = useSelector(getWorldState)

	const [scroll, setScroll] = useState(0)

	const [showMousePointer, setShowMousePointer] = useState(false)
	const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
	const [pointerPos, setPointerPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 })

	const [isDragging, setDragging] = useState(false)
	const onMouseDown = () => {
		setDragging(true)
	}

	const onMouseUp = () => {
		setDragging(false)
	}

	const onMouseEnter = () => {
		setShowMousePointer(true)
	}

	const onMouseLeave = () => {
		onMouseUp()
		setShowMousePointer(false)
	}

	const onMouseMove = (event: MouseEvent<HTMLDivElement>) => {
		// console.log(event.currentTarget)
		// const boundingRect = event.currentTarget.getBoundingClientRect()
		// const newPos = { x: event.screenX - boundingRect.left, y: event.screenY - boundingRect.top }

		// debouncedMove(event.currentTarget, event.screenX, event.screenY)

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
			onMouseEnter={onMouseEnter}
			onMouseLeave={onMouseLeave}
			onMouseMove={onMouseMove}
		>
			<TimelineAnchor offset={scroll} />
			{storyEvents.map((event) => (
				<TimelineEvent key={event.id} event={event} offset={scroll} />
			))}
		</TimelineContainer>
	)
}
