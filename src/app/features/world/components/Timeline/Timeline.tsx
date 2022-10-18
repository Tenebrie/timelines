import React, { MouseEvent, useState, WheelEvent } from 'react'
import { useSelector } from 'react-redux'

import clampToRange from '../../../../utils/clampToRange'
import { getWorldState } from '../../selectors'
import { TimelineEvent } from '../TimelineEvent/TimelineEvent'
import { TimelineAnchorLine, TimelineContainer } from './styles'

export const Timeline = () => {
	const { events: storyEvents } = useSelector(getWorldState)

	const [scale, setScale] = useState(1)
	const [scroll, setScroll] = useState(0)
	const [scaleSteps, setScaleSteps] = useState(1)

	const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 })

	const onWheel = (event: WheelEvent<HTMLDivElement>) => {
		const delta = event.deltaY

		const newSteps = clampToRange(1, scaleSteps - delta, 10000)
		const newScale = 1 + Math.pow(newSteps / 500, 2)

		const scaledMouseX = (mousePos.x - scroll) / scale
		const updatedScroll = mousePos.x - scaledMouseX * newScale

		setScroll(updatedScroll)

		setScaleSteps(newSteps)
		setScale(newScale)
	}

	const [isDragging, setDragging] = useState(false)
	const onMouseDown = () => {
		setDragging(true)
	}

	const onMouseUp = () => {
		setDragging(false)
	}

	const onMouseMove = (event: MouseEvent<HTMLDivElement>) => {
		const boundingRect = event.currentTarget.getBoundingClientRect()
		const newPos = { x: event.screenX - boundingRect.x, y: event.screenY - boundingRect.y }

		if (isDragging) {
			setScroll(scroll + newPos.x - mousePos.x)
		}
		setMousePos(newPos)
	}

	return (
		<TimelineContainer
			onMouseDown={onMouseDown}
			onMouseUp={onMouseUp}
			onMouseLeave={onMouseUp}
			onMouseMove={onMouseMove}
			onWheel={onWheel}
		>
			<TimelineAnchorLine />
			{storyEvents.map((event) => (
				<TimelineEvent key={event.id} event={event} scale={scale} offset={scroll} />
			))}
		</TimelineContainer>
	)
}
