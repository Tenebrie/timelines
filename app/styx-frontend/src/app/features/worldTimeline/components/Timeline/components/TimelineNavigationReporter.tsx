import { useNavigate, useSearch } from '@tanstack/react-router'
import throttle from 'lodash.throttle'
import { RefObject, useCallback, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { useEventBusDispatch } from '@/app/features/eventBus'
import { getWorldState } from '@/app/features/world/selectors'

import { useTimelineNavigation } from '../hooks/useTimelineNavigation'
import { timelineSlice } from '../reducer'
import { TimelineState } from '../utils/TimelineState'

type Props = {
	ref: RefObject<HTMLDivElement | null>
	containerWidth: number
}

export function TimelineNavigationReporter({ ref, containerWidth }: Props) {
	const selectedTime = useSearch({
		from: '/world/$worldId/_world',
		select: (search) => search.time,
	})
	const { timeOrigin } = useSelector(getWorldState, (a, b) => a.timeOrigin === b.timeOrigin)

	const navigate = useNavigate({ from: '/world/$worldId/timeline' })
	const scrollTimelineTo = useEventBusDispatch({ event: 'scrollTimelineTo' })
	const notifyTimelineScrolled = useEventBusDispatch({ event: 'timelineScrolled' })

	const { setScroll, setIsSwitchingScale, setScaleLevel, setTargetScaleLevel } = timelineSlice.actions
	const dispatch = useDispatch()

	const onClick = useCallback(
		(time: number) => {
			navigate({
				to: '/world/$worldId/timeline',
				search: (prev) => ({ ...prev, time }),
			})
		},
		[navigate],
	)

	const onDoubleClick = useCallback(
		(time: number) => {
			scrollTimelineTo({ timestamp: time })
			navigate({
				search: (prev) => ({ ...prev, selection: [] }),
			})
		},
		[navigate, scrollTimelineTo],
	)

	const { scroll, scaleLevel, targetScaleIndex, isSwitchingScale } = useTimelineNavigation({
		containerRef: ref,
		defaultScroll: Math.floor(containerWidth / 2) - timeOrigin,
		scaleLimits: [-1, 7],
		selectedTime,
		onClick: (time) => onClick(time),
		onDoubleClick: (time) => onDoubleClick(time),
	})

	useEffect(() => {
		dispatch(setIsSwitchingScale(isSwitchingScale))
	}, [dispatch, isSwitchingScale, setIsSwitchingScale])

	useEffect(() => {
		dispatch(setScaleLevel(scaleLevel))
	}, [dispatch, scaleLevel, setScaleLevel])

	useEffect(() => {
		dispatch(setTargetScaleLevel(targetScaleIndex))
	}, [dispatch, targetScaleIndex, setTargetScaleLevel])

	const thr = useRef(
		throttle((newScroll: number) => {
			requestAnimationFrame(() => {
				TimelineState.scroll = newScroll
				notifyTimelineScrolled({ newScroll })
			})
		}, 2),
	)

	const lastScroll = useRef<number | null>(null)
	if (scroll !== lastScroll.current) {
		lastScroll.current = scroll
		thr.current(scroll)
	}

	// useEffect(() => {
	// 	thr.current(scroll)
	// }, [dispatch, notifyTimelineScrolled, scroll, setScroll])

	return null
}
