import { MouseEvent, useCallback, useEffect, useRef, useState } from 'react'

import clampToRange from '../../../../utils/clampToRange'
import { rangeMap } from '../../../../utils/rangeMap'
import { TimelineAnchor } from './components/TimelineAnchor/TimelineAnchor'
import { TimelineEventGroup } from './components/TimelineEventGroup/TimelineEventGroup'
import useEventGroups from './hooks/useEventGroups'
import { TimelineContainer } from './styles'

export const Timeline = () => {
	const containerRef = useRef<HTMLDivElement | null>(null)

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

	const [timePerPixel, setTimePerPixel] = useState(1)
	const [scaleLevel, setScaleLevel] = useState(1)
	const [isSwitchingScale, setIsSwitchingScale] = useState(false)

	const [readyToSwitchScale, setReadyToSwitchScale] = useState(false)
	const [scaleSwitchesToDo, setScaleSwitchesToDo] = useState(0)
	const [switchingScaleTimeout, setSwitchingScaleTimeout] = useState<number | null>(null)

	const [scroll, setScroll] = useState(150)
	const [scaleScroll, setScaleScroll] = useState(0)

	const scaleLimits = [-3, 10]

	useEffect(() => {
		if (!readyToSwitchScale) {
			return
		}

		setScaleSwitchesToDo(0)
		setReadyToSwitchScale(false)

		let currentScroll = scroll
		let currentScaleScroll = scaleScroll
		let currentTimePerPixel = timePerPixel

		for (let i = 0; i < Math.abs(scaleSwitchesToDo); i++) {
			const newScaleScroll = clampToRange(
				scaleLimits[0] * 100,
				currentScaleScroll + 100 * Math.sign(scaleSwitchesToDo),
				scaleLimits[1] * 100
			)
			const newTimePerPixel = Math.pow(2, newScaleScroll / 100)

			const ratio = currentTimePerPixel / newTimePerPixel
			const midValue = (mousePos.x - currentScroll) * currentTimePerPixel

			if (ratio > 1) {
				currentScroll = Math.round(currentScroll - midValue / 2 / newTimePerPixel)
			} else if (ratio < 1) {
				currentScroll = Math.round(currentScroll + midValue / newTimePerPixel)
			}

			currentScaleScroll = newScaleScroll
			currentTimePerPixel = newTimePerPixel
		}

		const newScaleLevel = rangeMap(currentTimePerPixel, [
			['[0; 4)', 1],
			['[4; 32)', 0.1],
			['[32; 256)', 0.01],
			['[256; 2048]', 0.001],
		])

		if (newScaleLevel === null) {
			return
		}

		setScroll(currentScroll)
		setScaleLevel(newScaleLevel)
		setScaleScroll(currentScaleScroll)
		setTimePerPixel(currentTimePerPixel)

		setTimeout(() => {
			setIsSwitchingScale(false)
		})
	}, [mousePos.x, readyToSwitchScale, scaleScroll, scaleSwitchesToDo, scroll, timePerPixel])

	const onWheel = useCallback(
		(event: WheelEvent) => {
			event.preventDefault()

			const newScaleSwitchesToDo = scaleSwitchesToDo + Math.sign(event.deltaY)
			setScaleSwitchesToDo(newScaleSwitchesToDo)
			setIsSwitchingScale(true)

			if (switchingScaleTimeout !== null) {
				window.clearTimeout(switchingScaleTimeout)
			}

			const targetScale = clampToRange(
				scaleLimits[0],
				scaleScroll / 100 + newScaleSwitchesToDo,
				scaleLimits[1]
			)
			console.log(targetScale)
			// setTargetScaleLabel()

			const timeout = window.setTimeout(() => {
				setReadyToSwitchScale(true)
				setSwitchingScaleTimeout(null)
			}, 300)
			setSwitchingScaleTimeout(timeout)
		},
		[scaleSwitchesToDo, switchingScaleTimeout]
	)

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
