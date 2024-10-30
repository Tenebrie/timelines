import bezier from 'bezier-easing'
import throttle from 'lodash.throttle'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSelector } from 'react-redux'

import { Position } from '../../../../../../types/Position'
import clampToRange from '../../../../../utils/clampToRange'
import { isMacOS } from '../../../../../utils/isMacOS'
import { rangeMap } from '../../../../../utils/rangeMap'
import { getTimelinePreferences } from '../../../../preferences/selectors'
import { useTimelineLevelScalar } from '../../../../time/hooks/useTimelineLevelScalar'
import { useTimelineWorldTime } from '../../../../time/hooks/useTimelineWorldTime'
import { maximumTime, useWorldTime } from '../../../../time/hooks/useWorldTime'
import { useTimelineBusSubscribe } from '../../../hooks/useTimelineBus'
import { ScaleLevel } from '../types'
import { useTimelineScroll } from './useTimelineScroll'

type Props = {
	containerRef: React.MutableRefObject<HTMLDivElement | null>
	defaultScroll: number
	scaleLimits: [number, number]
	onClick: (time: number) => void
	onDoubleClick: (time: number) => void
}

export const useTimelineNavigation = ({
	containerRef,
	defaultScroll,
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
	const boundingRectTop = useRef(0)
	const boundingRectLeft = useRef(0)

	const { getLevelScalar } = useTimelineLevelScalar()
	const { parseTime, pickerToTimestamp } = useWorldTime()
	const { lineSpacing } = useSelector(getTimelinePreferences)

	const [scaleLevel, setScaleLevel] = useState<ScaleLevel>(0)
	const scalar = useMemo(() => getLevelScalar(scaleLevel), [getLevelScalar, scaleLevel])
	const minimumScroll = useMemo(() => -maximumTime / scalar / 1000 / 60, [scalar])
	const maximumScroll = useMemo(() => maximumTime / scalar / 1000 / 60, [scalar])

	const onMouseDown = useCallback((event: MouseEvent | TouchEvent) => {
		const clientX = 'clientX' in event ? event.clientX : event.touches[0].clientX
		const clientY = 'clientY' in event ? event.clientY : event.touches[0].clientY
		const boundingRect = (event.currentTarget as HTMLDivElement).getBoundingClientRect()
		boundingRectTop.current = boundingRect.top
		boundingRectLeft.current = boundingRect.left
		const newPos = { x: clientX - boundingRectLeft.current, y: clientY - boundingRectTop.current }
		setCanClick(true)
		setDraggingFrom(newPos)
		setMousePos(newPos)
	}, [])

	const onMouseUp = useCallback(() => {
		setDragging(false)
		setDraggingFrom(null)
	}, [])

	const onMouseMove = useCallback(
		(event: MouseEvent | TouchEvent) => {
			const clientX = 'clientX' in event ? event.clientX : event.touches[0].clientX
			const clientY = 'clientY' in event ? event.clientY : event.touches[0].clientY
			const newPos = { x: clientX - boundingRectLeft.current, y: clientY - boundingRectTop.current }

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
				if (isFinite(minimumScroll) && newScroll < minimumScroll) {
					setScroll(minimumScroll)
					setOverscroll(newScroll - minimumScroll)
				} else if (isFinite(maximumScroll) && newScroll > maximumScroll) {
					setScroll(maximumScroll)
					setOverscroll(newScroll - maximumScroll)
				} else {
					setScroll(newScroll)
					setOverscroll(0)
				}
				setCanClick(false)
				setMousePos(newPos)
			}
		},
		[draggingFrom, isDragging, scroll, mousePos.x, overscroll, minimumScroll, maximumScroll],
	)

	useEffect(() => {
		if (isDragging) {
			return
		}
		const interval = window.setInterval(() => {
			setOverscroll((overscroll) => overscroll * 0.9)
		}, 1)
		return () => window.clearInterval(interval)
	}, [isDragging])

	// Zoom
	const [timelineScale, setTimelineScale] = useState(1)
	const [isSwitchingScale, setIsSwitchingScale] = useState(false)
	const [isScrollUsingMouse, setIsScrollUsingMouse] = useState(false)

	const [readyToSwitchScale, setReadyToSwitchScale] = useState(false)
	const [scaleSwitchesToDo, setScaleSwitchesToDo] = useState(0)
	// const [switchingScaleTimeout, setSwitchingScaleTimeout] = useState<number | null>(null)
	const switchingScaleTimeout = useRef<number | null>(null)

	const [scaleScroll, setScaleScroll] = useState(0)

	const [targetScale, setTargetScale] = useState(0)

	const { realTimeToScaledTime, scaledTimeToRealTime } = useTimelineWorldTime({ scaleLevel })

	useEffect(() => {
		if (!readyToSwitchScale) {
			return
		}

		setScaleSwitchesToDo(0)
		setReadyToSwitchScale(false)
		const containerCenter = (containerRef.current?.getBoundingClientRect().width ?? 0) / 2
		const scrollIntoPos = isScrollUsingMouse ? mousePos.x : containerCenter

		let currentScaleScroll = scaleScroll
		let currentTimePerPixel = scaledTimeToRealTime(timelineScale)

		const timestampAtMouse = scaledTimeToRealTime((-scroll + scrollIntoPos) * timelineScale)

		for (let i = 0; i < Math.abs(scaleSwitchesToDo); i++) {
			const newScaleScroll = clampToRange(
				scaleLimits[0] * 100,
				currentScaleScroll + 100 * Math.sign(scaleSwitchesToDo),
				scaleLimits[1] * 100,
			)

			const newTimePerPixel = Math.pow(2, newScaleScroll / 100)

			currentScaleScroll = newScaleScroll
			currentTimePerPixel = newTimePerPixel
		}

		const newScaleLevel = rangeMap<ScaleLevel>(currentTimePerPixel, [
			['[0; 2)', 0],
			['[2; 4)', 1],
			['[4; 8)', 2],
			['[8; 16)', 3],
			['[16; 32)', 4],
			['[32; 64)', 5],
			['[64; 128)', 6],
			['[128; 256)', 7],
		])

		if (newScaleLevel === null) {
			return
		}

		if (currentTimePerPixel > 1) {
			currentTimePerPixel = 1
		}

		const scalar = getLevelScalar(newScaleLevel)
		const targetScroll = Math.floor(-timestampAtMouse / currentTimePerPixel / scalar + scrollIntoPos)
		const newMinimumScroll = -maximumTime / scalar / 1000 / 60
		const newMaximumScroll = maximumTime / scalar / 1000 / 60

		let scrollToSet = targetScroll
		if (isFinite(newMinimumScroll) && scrollToSet < newMinimumScroll) {
			scrollToSet = newMinimumScroll
		} else if (isFinite(newMaximumScroll) && scrollToSet > newMaximumScroll) {
			scrollToSet = newMaximumScroll
		}
		setScroll(scrollToSet)
		setScaleLevel(newScaleLevel)
		setScaleScroll(currentScaleScroll)
		setTimelineScale(currentTimePerPixel)

		setTimeout(() => {
			setIsSwitchingScale(false)
		})
	}, [
		containerRef,
		getLevelScalar,
		isScrollUsingMouse,
		mousePos.x,
		readyToSwitchScale,
		scaleLimits,
		scaleScroll,
		scaleSwitchesToDo,
		scaledTimeToRealTime,
		scroll,
		setScroll,
		timelineScale,
	])

	/**
	 * @param {number} scrollDirection - integer representing the direction of the scroll and number of steps.
	 */
	const performZoom = useCallback(
		(scrollDirection: number, useMouse: boolean) => {
			let newScaleSwitchesToDo = scaleSwitchesToDo + Math.sign(scrollDirection)
			let newTargetScale = clampToRange(
				scaleLimits[0],
				scaleScroll / 100 + newScaleSwitchesToDo,
				scaleLimits[1],
			)

			if (newTargetScale === 2) {
				newTargetScale += Math.sign(scrollDirection)
				newScaleSwitchesToDo += Math.sign(scrollDirection)
			}
			setScaleSwitchesToDo(newScaleSwitchesToDo)
			setIsSwitchingScale(true)
			setIsScrollUsingMouse(useMouse)
			setTargetScale(newTargetScale)

			if (switchingScaleTimeout.current !== null) {
				window.clearTimeout(switchingScaleTimeout.current)
			}

			const timeout = window.setTimeout(() => {
				setReadyToSwitchScale(true)
				switchingScaleTimeout.current = null
			}, 300)
			switchingScaleTimeout.current = timeout
		},
		[scaleLimits, scaleScroll, scaleSwitchesToDo],
	)

	const [requestedZoom, setRequestedZoom] = useState<number>(0)
	useEffect(() => {
		if (requestedZoom === 0) {
			return
		}
		performZoom(requestedZoom, false)
		setRequestedZoom(0)
	}, [performZoom, requestedZoom])

	const scrollAccumulator = useRef<number>(0)
	const onWheel = useCallback(
		(event: WheelEvent) => {
			event.preventDefault()

			const sensitivity = isMacOS() ? 1 / 75 : 1

			const scrollDirection = (() => {
				if (isMacOS()) {
					const currentValue = scrollAccumulator.current + event.deltaY * sensitivity
					if (Math.abs(currentValue) < 1) {
						scrollAccumulator.current = currentValue
						return 0
					}

					const actualDiff = Math.trunc(currentValue)
					scrollAccumulator.current -= actualDiff
					return actualDiff
				}
				return event.deltaY
			})()

			if (scrollDirection === 0) {
				return
			}

			const boundingRect = (event.currentTarget as HTMLDivElement).getBoundingClientRect()
			boundingRectTop.current = boundingRect.top
			boundingRectLeft.current = boundingRect.left
			const newPos = {
				x: event.clientX - boundingRectLeft.current,
				y: event.clientY - boundingRectTop.current,
			}

			setMousePos(newPos)
			performZoom(scrollDirection, true)
		},
		[performZoom],
	)

	// Click
	const [lastClickPos, setLastClickPos] = useState<number | null>(null)
	const [lastClickTime, setLastClickTime] = useState<number | null>(null)
	const onTimelineClick = useCallback(
		(event: MouseEvent) => {
			if (!canClick || event.target !== containerRef.current) {
				return
			}

			const boundingRect = (event.currentTarget as HTMLDivElement).getBoundingClientRect()
			boundingRectTop.current = boundingRect.top
			boundingRectLeft.current = boundingRect.left
			const point = {
				x: event.clientX - boundingRectLeft.current,
				y: event.clientY - boundingRectTop.current,
			}

			const roundToX = lineSpacing / timelineScale
			const clickOffset = Math.round((point.x - scroll) / roundToX) * roundToX * timelineScale
			let selectedTime = scaledTimeToRealTime(clickOffset)
			// For scaleLevel = 4, round to the nearest month
			if (scaleLevel === 4) {
				const t = parseTime(selectedTime)
				if (t.day >= 15) {
					t.monthIndex += 1
				}
				selectedTime = pickerToTimestamp({
					day: 0,
					hour: 0,
					minute: 0,
					monthDay: 1,
					monthIndex: t.monthIndex,
					year: t.year,
				})
			}

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
			}
		},
		[
			canClick,
			containerRef,
			lastClickPos,
			lastClickTime,
			lineSpacing,
			onClick,
			onDoubleClick,
			parseTime,
			pickerToTimestamp,
			scaleLevel,
			scaledTimeToRealTime,
			scroll,
			timelineScale,
		],
	)

	// Mouse events
	useEffect(() => {
		const container = containerRef.current
		if (!container) {
			return
		}

		container.addEventListener('click', onTimelineClick)
		container.addEventListener('mousedown', onMouseDown)
		document.addEventListener('mousemove', onMouseMove)
		document.addEventListener('mouseup', onMouseUp)
		container.addEventListener('touchstart', onMouseDown)
		container.addEventListener('touchmove', onMouseMove)
		container.addEventListener('touchend', onMouseUp)
		document.addEventListener('mouseleave', onMouseUp)
		container.addEventListener('wheel', onWheel)

		return () => {
			container.removeEventListener('click', onTimelineClick)
			container.removeEventListener('mousedown', onMouseDown)
			document.removeEventListener('mousemove', onMouseMove)
			document.removeEventListener('mouseup', onMouseUp)
			container.removeEventListener('touchstart', onMouseDown)
			container.removeEventListener('touchmove', onMouseMove)
			container.removeEventListener('touchend', onMouseUp)
			document.removeEventListener('mouseleave', onMouseUp)
			container.removeEventListener('wheel', onWheel)
		}
	}, [containerRef, onClick, onMouseDown, onMouseMove, onMouseUp, onTimelineClick, onWheel])

	const startedScrollFrom = useRef(0)
	const desiredScrollTo = useRef(0)
	const smoothScrollStartedAtTime = useRef(new Date())
	// Outside controls
	const scrollTo = useCallback(
		(timestamp: number) => {
			if (!containerRef.current) {
				return
			}

			const easing = bezier(0.5, 0, 0.5, 1)
			const targetScroll = Math.floor(
				realTimeToScaledTime(-timestamp / timelineScale) +
					containerRef.current.getBoundingClientRect().width / 2,
			)

			const isScrollingAlready =
				Math.abs(startedScrollFrom.current) > 0 || Math.abs(desiredScrollTo.current) > 0
			startedScrollFrom.current = scroll

			let scrollToSet = targetScroll
			if (isFinite(minimumScroll) && scrollToSet < minimumScroll) {
				scrollToSet = minimumScroll
			} else if (isFinite(maximumScroll) && scrollToSet > maximumScroll) {
				scrollToSet = maximumScroll
			}
			desiredScrollTo.current = scrollToSet
			smoothScrollStartedAtTime.current = new Date()

			/**
			 * Already scrolling.
			 * The existing callback will handle the new target.
			 */
			if (isScrollingAlready) {
				return
			}

			const callback = () => {
				const time = Math.min(1, (new Date().getTime() - smoothScrollStartedAtTime.current.getTime()) / 300)
				const bezierPos = easing(time)
				setScroll(
					startedScrollFrom.current + (desiredScrollTo.current - startedScrollFrom.current) * bezierPos,
				)
				if (time < 1) {
					requestAnimationFrame(callback)
				} else {
					startedScrollFrom.current = 0
					desiredScrollTo.current = 0
				}
			}

			requestAnimationFrame(callback)
		},
		[containerRef, minimumScroll, maximumScroll, realTimeToScaledTime, scroll, setScroll, timelineScale],
	)

	useTimelineBusSubscribe({
		callback: scrollTo,
	})

	// Published scroll
	const { setScroll: setPublicScroll } = useTimelineScroll()
	const throttledSetPublicScroll = useRef(throttle((val: number) => setPublicScroll(val), 100))

	useEffect(() => {
		const container = containerRef.current
		if (!container) {
			return
		}
		const timestamp = -(
			scaledTimeToRealTime(scroll - container.getBoundingClientRect().width / 2) * timelineScale
		)
		throttledSetPublicScroll.current(timestamp)
	}, [containerRef, scaledTimeToRealTime, scroll, throttledSetPublicScroll, timelineScale])

	return {
		scroll: scroll + Math.pow(Math.abs(overscroll), 0.85) * Math.sign(overscroll),
		timelineScale,
		scaleLevel,
		targetScaleIndex: targetScale,
		isSwitchingScale,
		scrollTo,
		performZoom: setRequestedZoom,
	}
}
