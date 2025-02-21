import { useNavigate, useSearch } from '@tanstack/react-router'
import { RefObject, useCallback, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { useEventBusDispatch } from '@/app/features/eventBus'
import { getWorldState } from '@/app/features/world/selectors'

import { useTimelineNavigation } from '../hooks/useTimelineNavigation'
import { timelineSlice } from '../reducer'

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

	const { setIsSwitchingScale, setScaleLevel, setTargetScaleLevel } = timelineSlice.actions
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

	const { scaleLevel, targetScaleIndex, isSwitchingScale } = useTimelineNavigation({
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

	return null
}
