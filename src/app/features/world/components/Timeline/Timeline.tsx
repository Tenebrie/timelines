import { MouseEvent, useCallback, useEffect, useRef, useState } from 'react'

import clampToRange from '../../../../utils/clampToRange'
import { rangeMap } from '../../../../utils/rangeMap'
import { TimelineAnchor } from './components/TimelineAnchor/TimelineAnchor'
import { TimelineEventGroup } from './components/TimelineEventGroup/TimelineEventGroup'
import useEventGroups from './hooks/useEventGroups'
import { TimelineContainer } from './styles'

export const Timeline = () => {
	const [scaleScroll, setScaleScroll] = useState(0)
	const [pixelsPerTime, setPixelsPerTime] = useState(1)
	const [labelMultiplier, setLabelMultiplier] = useState(1)

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

	const onWheel = useCallback(
		(event: WheelEvent) => {
			event.preventDefault()
			const delta = event.deltaY > 0 ? 100 : event.deltaY < 0 ? -100 : 0
			const newScaleScroll = clampToRange(-300, scaleScroll + delta, 1100)
			const newPixelsPerTime = Math.pow(2, newScaleScroll / 100)

			const newLabelMultiplier = rangeMap(newPixelsPerTime, [
				['[0; 4)', 1],
				['[4; 128)', 0.025],
				['[128; 2048]', 0.000625],
			])

			if (newLabelMultiplier === null) {
				return
			}

			setPixelsPerTime(newPixelsPerTime)
			setScaleScroll(newScaleScroll)
			setLabelMultiplier(newLabelMultiplier)

			const ratio = pixelsPerTime / newPixelsPerTime
			const midValue = (mousePos.x - scroll) * pixelsPerTime
			if (ratio > 1) {
				setScroll(Math.round(scroll - midValue / 2 / newPixelsPerTime))
			} else if (ratio < 1) {
				setScroll(Math.round(scroll + midValue / newPixelsPerTime))
			}
		},
		[
			mousePos,
			pixelsPerTime,
			setScroll,
			scroll,
			scaleScroll,
			setPixelsPerTime,
			setScaleScroll,
			setLabelMultiplier,
		]
	)

	const containerRef = useRef<HTMLDivElement | null>(null)

	useEffect(() => {
		const ref = containerRef.current
		ref?.addEventListener('wheel', onWheel)

		return () => {
			ref?.removeEventListener('wheel', onWheel)
		}
	}, [onWheel, containerRef])

	const eventGroups = useEventGroups(pixelsPerTime)

	return (
		<TimelineContainer
			ref={containerRef}
			onMouseDown={onMouseDown}
			onMouseUp={onMouseUp}
			onMouseLeave={onMouseUp}
			onMouseMove={onMouseMove}
		>
			<TimelineAnchor offset={scroll} pixelsPerTime={pixelsPerTime} labelMultiplier={labelMultiplier} />
			{eventGroups.map((group) => (
				<TimelineEventGroup
					key={group.timestamp}
					eventGroup={group}
					scroll={scroll}
					pixelsPerTime={pixelsPerTime}
				/>
			))}
		</TimelineContainer>
	)
}
