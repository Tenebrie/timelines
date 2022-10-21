import React, { useCallback, useEffect, useState } from 'react'

import clampToRange from '../../../../../utils/clampToRange'
import { rangeMap } from '../../../../../utils/rangeMap'

type Props = {
	containerRef: React.MutableRefObject<HTMLDivElement | null>
	defaultScroll: number
	scaleLimits: [number, number]
}

export const useTimelineNavigation = ({ containerRef, defaultScroll, scaleLimits }: Props) => {
	// Scroll
	const [scroll, setScroll] = useState(defaultScroll)
	const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
	const [isDragging, setDragging] = useState(false)
	const onMouseDown = useCallback(() => {
		setDragging(true)
	}, [])

	const onMouseUp = useCallback(() => {
		setDragging(false)
	}, [])

	const onMouseMove = useCallback(
		(event: MouseEvent) => {
			const boundingRect = (event.currentTarget as HTMLDivElement).getBoundingClientRect()
			const newPos = { x: event.clientX - boundingRect.left, y: event.clientY - boundingRect.top }

			if (isDragging) {
				setScroll(scroll + newPos.x - mousePos.x)
			}
			setMousePos(newPos)
		},
		[isDragging, mousePos.x, scroll]
	)

	useEffect(() => {
		const container = containerRef.current
		if (!container) {
			return
		}

		container.addEventListener('mousedown', onMouseDown)
		container.addEventListener('mousemove', onMouseMove)
		container.addEventListener('mouseup', onMouseUp)
		container.addEventListener('mouseleave', onMouseUp)

		return () => {
			container.removeEventListener('mousedown', onMouseDown)
			container.removeEventListener('mousemove', onMouseMove)
			container.removeEventListener('mouseup', onMouseUp)
			container.removeEventListener('mouseleave', onMouseUp)
		}
	}, [onMouseDown, onMouseUp, onMouseMove, containerRef])

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

		setScroll(currentScroll)
		setScaleLevel(newScaleLevel)
		setScaleScroll(currentScaleScroll)
		setTimePerPixel(currentTimePerPixel)

		setTimeout(() => {
			setIsSwitchingScale(false)
		})
	}, [
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

	useEffect(() => {
		const container = containerRef.current
		if (!container) {
			return
		}

		container.addEventListener('wheel', onWheel)

		return () => {
			container.removeEventListener('wheel', onWheel)
		}
	}, [onWheel, containerRef])

	return {
		scroll,
		timePerPixel,
		scaleLevel,
		targetScaleIndex: targetScale,
		isSwitchingScale,
	}
}
