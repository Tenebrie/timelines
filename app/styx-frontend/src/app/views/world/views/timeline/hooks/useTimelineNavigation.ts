import React, { useEffect, useMemo } from 'react'
import { useSelector } from 'react-redux'

import { useTimelineLevelScalar } from '@/app/features/time/hooks/useTimelineLevelScalar'
import { maximumTime } from '@/app/features/time/hooks/useWorldTime'
import { ScaleLevel } from '@/app/schema/ScaleLevel'
import { getWorldCalendarState } from '@/app/views/world/WorldSliceSelectors'
import { router } from '@/router'

import { useTimelineClick } from './useTimelineClick'
import { useTimelineExternalScroll } from './useTimelineExternalScroll'
import { useTimelineScroll } from './useTimelineScroll'
import { useTimelineWheel } from './useTimelineWheel'
import { useTimelineZoom } from './useTimelineZoom'

type Props = {
	containerRef: React.RefObject<HTMLDivElement | null>
	defaultScroll: number
	selectedTime: number | null
	scaleLimits: [ScaleLevel, ScaleLevel]
	onClick: (time: number, trackId: string | undefined) => void
	onDoubleClick: (time: number, trackId: string | undefined) => void
}

export const useTimelineNavigation = ({
	containerRef,
	defaultScroll,
	selectedTime: defaultSelectedTime,
	scaleLimits,
	onClick,
	onDoubleClick,
}: Props) => {
	const { getLevelScalar } = useTimelineLevelScalar()
	const calendar = useSelector(getWorldCalendarState)

	const initialScaleLevel: ScaleLevel = router.state.location.search.scale ?? 0

	// Scroll management
	const scalar = useMemo(() => getLevelScalar(initialScaleLevel), [getLevelScalar, initialScaleLevel])
	const minimumScroll = useMemo(() => -maximumTime / scalar / 1000 / 60, [scalar])
	const maximumScroll = useMemo(() => maximumTime / scalar / 1000 / 60, [scalar])

	const scrollHook = useTimelineScroll({
		defaultScroll,
		scaleLevel: initialScaleLevel,
		minimumScroll,
		maximumScroll,
	})

	// Zoom management
	const zoomHook = useTimelineZoom({
		containerRef,
		scrollRef: scrollHook.scrollRef,
		selectedTime: defaultSelectedTime,
		scaleLimits,
		initialScaleLevel,
		calendar,
		setScroll: scrollHook.setScroll,
	})

	// Click and wheel interactions
	const clickHook = useTimelineClick({
		containerRef,
		scrollRef: scrollHook.scrollRef,
		scaleLevel: zoomHook.scaleLevel,
		scaledTimeToRealTime: zoomHook.scaledTimeToRealTime,
		onClick,
		onDoubleClick,
	})

	// Wheel scroll
	const { onWheel } = useTimelineWheel({
		scrollRef: scrollHook.scrollRef,
		setScroll: scrollHook.setScroll,
		performZoom: zoomHook.performZoom,
		containerRef,
	})

	// Smooth scroll
	useTimelineExternalScroll({
		containerRef,
		scrollRef: scrollHook.scrollRef,
		minimumScroll,
		maximumScroll,
		realTimeToScaledTime: zoomHook.realTimeToScaledTime,
		setScroll: scrollHook.setScroll,
	})

	// Update selected time when default changes
	useEffect(() => {
		clickHook.setSelectedTime(defaultSelectedTime)
	}, [defaultSelectedTime, clickHook])

	// Mouse and wheel event listeners
	useEffect(() => {
		const container = containerRef.current
		if (!container) {
			return
		}

		const onMouseMove = (event: MouseEvent) => {
			scrollHook.onMouseMoveThrottled.current(event, scrollHook.minimumScroll, scrollHook.maximumScroll)
		}

		container.addEventListener('click', clickHook.onTimelineClick)
		container.addEventListener('mousedown', scrollHook.onMouseDown)
		document.addEventListener('mousemove', onMouseMove)
		document.addEventListener('mouseup', scrollHook.onMouseUp)
		document.addEventListener('mouseleave', scrollHook.onMouseUp)
		container.addEventListener('wheel', onWheel)

		return () => {
			container.removeEventListener('click', clickHook.onTimelineClick)
			container.removeEventListener('mousedown', scrollHook.onMouseDown)
			document.removeEventListener('mousemove', onMouseMove)
			document.removeEventListener('mouseup', scrollHook.onMouseUp)
			document.removeEventListener('mouseleave', scrollHook.onMouseUp)
			container.removeEventListener('wheel', onWheel)
		}
	}, [containerRef, scrollHook, clickHook, onWheel])

	return {
		scaleLevel: zoomHook.scaleLevel,
		targetScaleIndex: zoomHook.targetScaleIndex,
		isSwitchingScale: zoomHook.isSwitchingScale,
	}
}
