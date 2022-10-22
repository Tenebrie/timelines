import React, { useCallback, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

import { Position } from '../../../../../../types/Position'
import clampToRange from '../../../../../utils/clampToRange'
import { rangeMap } from '../../../../../utils/rangeMap'
import { getWorldState } from '../../../selectors'

type Props = {
	containerRef: React.MutableRefObject<HTMLDivElement | null>
	defaultScroll: number
	maximumScroll: number
	scaleLimits: [number, number]
	onClick: (time: number) => void
	onDoubleClick: (time: number) => void
}

export const useTimelineNavigation = ({
	containerRef,
	defaultScroll,
	maximumScroll,
	scaleLimits,
	onClick,
	onDoubleClick,
}: Props) => {
	// Scroll
	const [scroll, setScroll] = useState(defaultScroll)
	const [overscroll, setOverscroll] = useState(0)
	const [draggingFrom, setDraggingFrom] = useState<Position | null>(null)
	const [mousePos, setMousePos] = useState<Position>({ x: 0, y: 0 })
	const [isDragging, setDragging] = useState(false)
	const [canClick, setCanClick] = useState(true)

	const { hoveredEventMarkers } = useSelector(getWorldState)

	const onMouseDown = useCallback((event: MouseEvent) => {
		const boundingRect = (event.currentTarget as HTMLDivElement).getBoundingClientRect()
		const newPos = { x: event.clientX - boundingRect.left, y: event.clientY - boundingRect.top }
		setCanClick(true)
		setDraggingFrom(newPos)
	}, [])

	const onMouseUp = useCallback(() => {
		setDragging(false)
		setDraggingFrom(null)
	}, [])

	const onMouseMove = useCallback(
		(event: MouseEvent) => {
			const boundingRect = (event.currentTarget as HTMLDivElement).getBoundingClientRect()
			const newPos = { x: event.clientX - boundingRect.left, y: event.clientY - boundingRect.top }

			if (draggingFrom !== null) {
				/* If the mouse moved less than N pixels, do not start dragging */
				/* Makes clicking feel more responsive with accidental mouse movements */
				const dist = Math.abs(newPos.x - draggingFrom.x)
				if (dist >= 5) {
					setDragging(true)
				}
			}

			if (isDragging) {
				const newScroll = scroll + newPos.x - mousePos.x + overscroll
				if (newScroll > maximumScroll) {
					setScroll(maximumScroll)
					setOverscroll(newScroll - maximumScroll)
				} else {
					setScroll(newScroll)
					setOverscroll(0)
				}
				setCanClick(false)
			}
			setMousePos(newPos)
		},
		[draggingFrom, isDragging, maximumScroll, mousePos.x, overscroll, scroll]
	)

	useEffect(() => {
		if (isDragging) {
			return
		}
		const interval = window.setInterval(() => {
			setOverscroll((overscroll) => overscroll * 0.9)
		}, 5)
		return () => window.clearInterval(interval)
	}, [isDragging])

	// Zoom
	const [timePerPixel, setTimePerPixel] = useState(1)
	const [scaleLevel, setScaleLevel] = useState(1)
	const [isSwitchingScale, setIsSwitchingScale] = useState(false)

	const [readyToSwitchScale, setReadyToSwitchScale] = useState(false)
	const [scaleSwitchesToDo, setScaleSwitchesToDo] = useState(0)
	const [switchingScaleTimeout, setSwitchingScaleTimeout] = useState<number | null>(null)

	const [scaleScroll, setScaleScroll] = useState(0)

	const [targetScale, setTargetScale] = useState(0)

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

		setScroll(Math.min(currentScroll, maximumScroll))
		setScaleLevel(newScaleLevel)
		setScaleScroll(currentScaleScroll)
		setTimePerPixel(currentTimePerPixel)

		setTimeout(() => {
			setIsSwitchingScale(false)
		})
	}, [
		maximumScroll,
		mousePos.x,
		readyToSwitchScale,
		scaleLimits,
		scaleScroll,
		scaleSwitchesToDo,
		scroll,
		setScroll,
		timePerPixel,
	])

	const onWheel = useCallback(
		(event: WheelEvent) => {
			event.preventDefault()

			const newScaleSwitchesToDo = scaleSwitchesToDo + Math.sign(event.deltaY)
			setScaleSwitchesToDo(newScaleSwitchesToDo)
			setIsSwitchingScale(true)
			setTargetScale(clampToRange(scaleLimits[0], scaleScroll / 100 + newScaleSwitchesToDo, scaleLimits[1]))

			if (switchingScaleTimeout !== null) {
				window.clearTimeout(switchingScaleTimeout)
			}

			const timeout = window.setTimeout(() => {
				setReadyToSwitchScale(true)
				setSwitchingScaleTimeout(null)
			}, 300)
			setSwitchingScaleTimeout(timeout)
		},
		[scaleLimits, scaleScroll, scaleSwitchesToDo, switchingScaleTimeout]
	)

	// Click
	const [lastClickPos, setLastClickPos] = useState<number | null>(null)
	const [lastClickTime, setLastClickTime] = useState<number | null>(null)
	const onTimelineClick = useCallback(
		(event: MouseEvent) => {
			if (!canClick || hoveredEventMarkers.length > 0) {
				return
			}

			const boundingRect = (event.currentTarget as HTMLDivElement).getBoundingClientRect()
			const point = { x: event.clientX - boundingRect.left, y: event.clientY - boundingRect.top }

			const roundToX = 10 / timePerPixel / scaleLevel
			const selectedTime = Math.round((point.x - scroll) / roundToX) * roundToX * timePerPixel

			const currentTime = Date.now()
			if (
				lastClickTime === null ||
				lastClickPos === null ||
				currentTime - lastClickTime > 500 ||
				Math.abs(point.x - lastClickPos) > 5
			) {
				onClick(selectedTime)
				setLastClickPos(point.x)
				setLastClickTime(currentTime)
			} else {
				onDoubleClick(selectedTime)
				setLastClickPos(null)
				setLastClickTime(null)
			}
		},
		[
			canClick,
			hoveredEventMarkers.length,
			lastClickPos,
			lastClickTime,
			onClick,
			onDoubleClick,
			scaleLevel,
			scroll,
			timePerPixel,
		]
	)

	// Mouse events
	useEffect(() => {
		const container = containerRef.current
		if (!container) {
			return
		}

		container.addEventListener('click', onTimelineClick)
		container.addEventListener('mousedown', onMouseDown)
		container.addEventListener('mousemove', onMouseMove)
		container.addEventListener('mouseup', onMouseUp)
		container.addEventListener('mouseleave', onMouseUp)
		container.addEventListener('wheel', onWheel)

		return () => {
			container.removeEventListener('click', onTimelineClick)
			container.removeEventListener('mousedown', onMouseDown)
			container.removeEventListener('mousemove', onMouseMove)
			container.removeEventListener('mouseup', onMouseUp)
			container.removeEventListener('mouseleave', onMouseUp)
			container.removeEventListener('wheel', onWheel)
		}
	}, [containerRef, onClick, onMouseDown, onMouseMove, onMouseUp, onWheel])

	return {
		scroll: scroll + Math.pow(overscroll, 0.85),
		timePerPixel,
		scaleLevel,
		targetScaleIndex: targetScale,
		isSwitchingScale,
	}
}
