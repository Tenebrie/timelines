import React, { MouseEvent, useContext, useState, WheelEvent } from 'react'
import styled from 'styled-components'

import { GlobalContext } from '../../context/GlobalContext'
import { StoryEvent } from '../../types/StoryEvent'
import { clamp } from '../../utils/utils'

const TimelineContainer = styled.div`
	position: relative;
	width: 100%;
	height: 256px;
	background: #1c4572;
	border-radius: 16px;
	overflow: hidden;
`

const TimelineAnchorLine = styled.div`
	position: absolute;
	width: 100%;
	height: 2px;
	top: 50%;
	background: black;
`

type StoryEventMarkerProps = {
	offset: number
}
const StoryEventMarkerOdd = styled.div.attrs<StoryEventMarkerProps>((props) => ({
	style: {
		left: `${props.offset}px`,
	},
}))<StoryEventMarkerProps>`
	width: 3px;
	position: absolute;
	height: 18px;
	background: black;
	top: calc(50% + 2px);
	border-radius: 0 0 3px 3px;
`
const StoryEventMarkerEven = styled.div.attrs<StoryEventMarkerProps>((props) => ({
	style: {
		left: `${props.offset}px`,
	},
}))<StoryEventMarkerProps>`
	width: 3px;
	position: absolute;
	height: 18px;
	background: black;
	bottom: 50%;
	border-radius: 3px 3px 0 0;
`

const StoryEventMarkerPointOdd = styled.div`
	position: absolute;
	margin-left: -50%;
	margin-top: -50%;
	bottom: -13px;
	left: -3px;
	border-radius: 100%;
	width: 12px;
	height: 12px;
	background: black;
`

const StoryEventMarkerPointEven = styled.div`
	position: absolute;
	margin-left: -50%;
	margin-top: -50%;
	top: -13px;
	left: -3px;
	border-radius: 100%;
	width: 12px;
	height: 12px;
	background: black;
`

const StoryEventMarkerInfoContainer = styled.div`
	position: absolute;
	display: flex;
	align-items: center;
	justify-content: center;
	width: 250px;
	margin-left: -125px;
`

const StoryEventMarkerInfoContainerOdd = styled(StoryEventMarkerInfoContainer)`
	top: 32px;
`

const StoryEventMarkerInfoContainerEven = styled(StoryEventMarkerInfoContainer)`
	bottom: 36px;
`

const StoryEventMarkerInfoText = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 8px;
	background: rgba(200, 200, 255, 0.2);
	border-radius: 8px;
	font-weight: 600;
	user-select: none;
	cursor: pointer;
`

const StoryEventMarkerInfo = (props: { event: StoryEvent; index: number }) => {
	const { event, index } = props
	const isEven = index % 2 === 0
	const isOdd = !isEven
	return (
		<div>
			{isOdd && (
				<StoryEventMarkerInfoContainerOdd>
					<StoryEventMarkerInfoText>{event.name}</StoryEventMarkerInfoText>
				</StoryEventMarkerInfoContainerOdd>
			)}
			{isEven && (
				<StoryEventMarkerInfoContainerEven>
					<StoryEventMarkerInfoText>{event.name}</StoryEventMarkerInfoText>
				</StoryEventMarkerInfoContainerEven>
			)}
		</div>
	)
}

export const TimelineEvent = (props: { event: StoryEvent; index: number; offset: number; scale: number }) => {
	const { event, scale, index } = props
	const offset = Math.floor(event.timestamp * scale + props.offset)
	const isEven = index % 2 === 0
	const isOdd = !isEven
	return (
		<div>
			{isOdd && (
				<StoryEventMarkerOdd offset={offset}>
					<StoryEventMarkerPointOdd />
					<StoryEventMarkerInfo event={event} index={index} />
				</StoryEventMarkerOdd>
			)}
			{isEven && (
				<StoryEventMarkerEven offset={offset}>
					<StoryEventMarkerPointEven />
					<StoryEventMarkerInfo event={event} index={index} />
				</StoryEventMarkerEven>
			)}
		</div>
	)
}

export const Timeline = () => {
	const { storyEvents } = useContext(GlobalContext)

	const [scale, setScale] = useState(1)
	const [scroll, setScroll] = useState(0)
	const [scaleSteps, setScaleSteps] = useState(1)

	const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 })

	const onWheel = (event: WheelEvent<HTMLDivElement>) => {
		const delta = event.deltaY

		const newSteps = clamp(1, scaleSteps - delta, 10000)
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
			{storyEvents.map((event, index) => (
				<TimelineEvent
					key={`${event.timestamp}-${index}`}
					event={event}
					index={index}
					scale={scale}
					offset={scroll}
				/>
			))}
		</TimelineContainer>
	)
}
