import { MouseEvent, useCallback, useEffect, useRef, useState } from 'react'

import clampToRange from '../../../../utils/clampToRange'
import { rangeMap } from '../../../../utils/rangeMap'
import { TimelineAnchor } from './components/TimelineAnchor/TimelineAnchor'
import { TimelineEventGroup } from './components/TimelineEventGroup/TimelineEventGroup'
import useEventGroups from './hooks/useEventGroups'
import { TimelineContainer } from './styles'

export const Timeline = () => {
	const [timePerPixel, setTimePerPixel] = useState(1)
	const [scaleLevel, setScaleLevel] = useState(1)
	const [isSwitchingScale, setIsSwitchingScale] = useState(false)

	const [scroll, setScroll] = useState(150)
	const [scaleScroll, setScaleScroll] = useState(0)

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
		const newPos = { x: event.clientX - boundingRect.left, y: event.clientY - boundingRect.top }

		if (isDragging) {
			setScroll(scroll + newPos.x - mousePos.x)
		}
		setMousePos(newPos)
	}

	const onWheel = useCallback(
		(event: WheelEvent) => {
			event.preventDefault()

			if (isSwitchingScale) {
				return
			}

			const delta = event.deltaY > 0 ? 100 : event.deltaY < 0 ? -100 : 0
			const newScaleScroll = clampToRange(-300, scaleScroll + delta, 1000)
			const newTimePerPixel = Math.pow(2, newScaleScroll / 100)

			// const newLabelMultiplier = rangeMap(newPixelsPerTime, [
			// 	['[0; 4)', 1],
			// 	['[4; 128)', 0.025],
			// 	['[128; 2048]', 0.000625],
			// ])

			const newScaleLevel = rangeMap(newTimePerPixel, [
				['[0; 4)', 1],
				['[4; 32)', 0.1],
				['[32; 256)', 0.01],
				['[256; 2048]', 0.001],
			])

			if (newScaleLevel === null) {
				return
			}

			setIsSwitchingScale(true)
			setTimeout(() => {
				setTimePerPixel(newTimePerPixel)
				setScaleScroll(newScaleScroll)
				setScaleLevel(newScaleLevel)

				const ratio = timePerPixel / newTimePerPixel
				const midValue = (mousePos.x - scroll) * timePerPixel
				if (ratio > 1) {
					setScroll(Math.round(scroll - midValue / 2 / newTimePerPixel))
				} else if (ratio < 1) {
					setScroll(Math.round(scroll + midValue / newTimePerPixel))
				}
				setTimeout(() => {
					setIsSwitchingScale(false)
				})
			}, 300)
		},
		[
			mousePos,
			timePerPixel,
			setScroll,
			scroll,
			scaleScroll,
			setTimePerPixel,
			setScaleScroll,
			setScaleLevel,
			isSwitchingScale,
			setIsSwitchingScale,
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

	const eventGroups = useEventGroups(timePerPixel)

	return (
		<TimelineContainer
			ref={containerRef}
			onMouseDown={onMouseDown}
			onMouseUp={onMouseUp}
			onMouseLeave={onMouseUp}
			onMouseMove={onMouseMove}
		>
			<TimelineAnchor
				visible={!isSwitchingScale}
				scroll={scroll}
				timePerPixel={timePerPixel}
				scaleLevel={scaleLevel}
			/>
			{eventGroups.map((group) => (
				<TimelineEventGroup
					key={group.timestamp}
					visible={!isSwitchingScale}
					scroll={scroll}
					eventGroup={group}
					pixelsPerTime={timePerPixel}
				/>
			))}
		</TimelineContainer>
	)
}
