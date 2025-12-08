import { startTransition, useCallback, useEffect, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'

import { WorldCalendarType } from '@/api/types/worldTypes'
import { useEventBusSubscribe } from '@/app/features/eventBus'
import { preferencesSlice } from '@/app/features/preferences/PreferencesSlice'
import { useTimelineLevelScalar } from '@/app/features/time/hooks/useTimelineLevelScalar'
import { useTimelineWorldTime } from '@/app/features/time/hooks/useTimelineWorldTime'
import { maximumTime } from '@/app/features/time/hooks/useWorldTime'
import { ScaleLevel } from '@/app/schema/ScaleLevel'
import clampToRange from '@/app/utils/clampToRange'
import { rangeMap } from '@/app/utils/rangeMap'

type Props = {
	containerRef: React.RefObject<HTMLDivElement | null>
	scrollRef: React.RefObject<number>
	selectedTime: number | null
	scaleLimits: [ScaleLevel, ScaleLevel]
	initialScaleLevel: ScaleLevel
	calendar: WorldCalendarType
	setScroll: (scroll: number) => void
}

export const useTimelineZoom = ({
	containerRef,
	scrollRef,
	selectedTime,
	scaleLimits,
	initialScaleLevel,
	calendar,
	setScroll,
}: Props) => {
	const { getLevelScalar } = useTimelineLevelScalar()
	const { setScaleLevel: setPreferredScaleLevel } = preferencesSlice.actions
	const dispatch = useDispatch()

	const [scaleLevel, setScaleLevel] = useState<ScaleLevel>(initialScaleLevel)
	const [isSwitchingScale, setIsSwitchingScale] = useState(false)
	const [isScrollUsingMouse, setIsScrollUsingMouse] = useState(false)
	const [readyToSwitchScale, setReadyToSwitchScale] = useState(false)
	const [scaleSwitchesToDo, setScaleSwitchesToDo] = useState(0)
	const switchingScaleTimeout = useRef<number | null>(null)
	const [scaleScroll, setScaleScroll] = useState(scaleLevel * 100)
	const [targetScale, setTargetScale] = useState(scaleLevel)

	const { realTimeToScaledTime, scaledTimeToRealTime } = useTimelineWorldTime({ scaleLevel, calendar })

	useEffect(() => {
		if (!readyToSwitchScale) {
			return
		}

		setScaleSwitchesToDo(0)
		setReadyToSwitchScale(false)
		const selectedTimeOnScreen = Math.round(realTimeToScaledTime(selectedTime ?? 0) + scrollRef.current)
		const containerWidth = containerRef.current?.getBoundingClientRect().width ?? 0
		const scrollIntoPos = Math.max(0, Math.min(containerWidth, selectedTimeOnScreen))

		let currentScaleScroll = scaleScroll
		let currentTimePerPixel: number = 0

		const timestampAtMouse = scaledTimeToRealTime(-scrollRef.current + scrollIntoPos)

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
			['[0.5; 1)', -1],
			['[1; 2)', 0],
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

		const scalar = getLevelScalar(newScaleLevel)
		const targetScroll = Math.floor(-timestampAtMouse / scalar + scrollIntoPos)
		const newMinimumScroll = -maximumTime / scalar / 1000 / 60
		const newMaximumScroll = maximumTime / scalar / 1000 / 60

		let scrollToSet = targetScroll
		if (isFinite(newMinimumScroll) && scrollToSet < newMinimumScroll) {
			scrollToSet = newMinimumScroll
		} else if (isFinite(newMaximumScroll) && scrollToSet > newMaximumScroll) {
			scrollToSet = newMaximumScroll
		}
		scrollRef.current = scrollToSet
		setScroll(scrollToSet)
		setScaleLevel(newScaleLevel)
		setScaleScroll(currentScaleScroll)
		dispatch(setPreferredScaleLevel(newScaleLevel))

		startTransition(() => {
			setIsSwitchingScale(false)
		})
	}, [
		containerRef,
		getLevelScalar,
		isScrollUsingMouse,
		readyToSwitchScale,
		scaleLimits,
		scaleScroll,
		scaleSwitchesToDo,
		scaledTimeToRealTime,
		realTimeToScaledTime,
		setScroll,
		selectedTime,
		dispatch,
		setPreferredScaleLevel,
		scrollRef,
	])

	/**
	 * @param {number} scrollDirection - integer representing the direction of the scroll and number of steps.
	 */
	const performZoom = useCallback(
		(scrollDirection: number, useMouse: boolean) => {
			const newScaleSwitchesToDo = scaleSwitchesToDo + Math.sign(scrollDirection)
			const newTargetScale = clampToRange(
				scaleLimits[0],
				Math.round(scaleScroll / 100 + newScaleSwitchesToDo),
				scaleLimits[1],
			) as ScaleLevel

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

	useEventBusSubscribe({
		event: 'timeline/requestZoom',
		callback: (props) => {
			setRequestedZoom(props.direction === 'in' ? -1 : 1)
		},
	})

	useEffect(() => {
		if (requestedZoom === 0) {
			return
		}
		performZoom(requestedZoom, false)
		setRequestedZoom(0)
	}, [performZoom, requestedZoom])

	return {
		scaleLevel,
		targetScaleIndex: targetScale,
		isSwitchingScale,
		performZoom,
		realTimeToScaledTime,
		scaledTimeToRealTime,
	}
}
