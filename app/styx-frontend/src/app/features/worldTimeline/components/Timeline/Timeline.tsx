import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { useEventBusDispatch, useEventBusSubscribe } from '@/app/features/eventBus'
import { useTimelineWorldTime } from '@/app/features/time/hooks/useTimelineWorldTime'
import { getWorldState } from '@/app/features/world/selectors'
import { useCustomTheme } from '@/app/hooks/useCustomTheme'

import { TimelineAnchor } from './components/TimelineAnchor/TimelineAnchor'
import { useTimelineContextMenu } from './components/TimelineContextMenu/hooks/useTimelineContextMenu'
import { TimelineControls } from './components/TimelineControls'
import { TimelineScaleLabel } from './components/TimelineScaleLabel/TimelineScaleLabel'
import { TimelineTracks } from './components/TimelineTracks/TimelineTracks'
import { TimelineZoomReporter } from './components/TimelineZoomReporter'
import { TimeMarker } from './components/TimeMarker/TimeMarker'
import { useTimelineDimensions } from './hooks/useTimelineDimensions'
import { useTimelineNavigation } from './hooks/useTimelineNavigation'
import { timelineSlice } from './reducer'
import { TimelineContainer, TimelineWrapper } from './styles'
import { TimelineState } from './utils/TimelineState'

export const Timeline = memo(TimelineComponent)

function TimelineComponent() {
	const selectedTime = useSearch({
		from: '/world/$worldId/_world',
		select: (search) => search.time,
	})
	const { timeOrigin, calendar, isLoaded } = useSelector(
		getWorldState,
		(a, b) => a.calendar === b.calendar && a.timeOrigin === b.timeOrigin && a.isLoaded === b.isLoaded,
	)
	const theme = useCustomTheme()

	const { setScaleLevel } = timelineSlice.actions
	const dispatch = useDispatch()
	const navigate = useNavigate({ from: '/world/$worldId/timeline' })

	const scrollTimelineTo = useEventBusDispatch({ event: 'scrollTimelineTo' })

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

	const { containerRef, containerWidth } = useTimelineDimensions()

	const { scroll, scaleLevel, targetScaleIndex, isSwitchingScale } = useTimelineNavigation({
		containerRef: containerRef,
		defaultScroll: Math.floor(containerWidth / 2) - timeOrigin,
		scaleLimits: [-1, 7],
		selectedTime,
		onClick: (time) => onClick(time),
		onDoubleClick: (time) => onDoubleClick(time),
	})

	useEffect(() => {
		dispatch(setScaleLevel(scaleLevel))
	}, [dispatch, scaleLevel, setScaleLevel])

	const { onContextMenu } = useTimelineContextMenu({
		scaleLevel,
	})

	const notifyTimelineScrolled = useEventBusDispatch({
		event: 'timelineScrolled',
	})

	useEffect(() => {
		TimelineState.scroll = scroll
		notifyTimelineScrolled()
	}, [notifyTimelineScrolled, scroll])

	const { scaledTimeToRealTime } = useTimelineWorldTime({ scaleLevel, calendar })
	const onScrollFullPage = useCallback(
		(side: 'left' | 'right') => {
			const currentTimestamp = scaledTimeToRealTime(-scroll)
			const sideScalar = side === 'left' ? -1 : 1
			scrollTimelineTo({
				timestamp: currentTimestamp + scaledTimeToRealTime(containerWidth * sideScalar + containerWidth / 2),
			})
		},
		[scaledTimeToRealTime, scroll, scrollTimelineTo, containerWidth],
	)
	useEventBusSubscribe({ event: 'scrollTimelineLeft', callback: () => onScrollFullPage('left') })
	useEventBusSubscribe({ event: 'scrollTimelineRight', callback: () => onScrollFullPage('right') })

	const isShown = useRef(false)
	const [opacity, setOpacity] = useState(0)
	useEffect(() => {
		if (isShown.current || !isLoaded) {
			return
		}
		isShown.current = true
		scrollTimelineTo({
			timestamp: selectedTime,
			skipAnim: true,
		})
		requestIdleCallback(() => {
			setOpacity(1)
		})
	}, [isLoaded, scrollTimelineTo, selectedTime])

	return (
		<Paper sx={{ height: '100%', borderRadius: 0, zIndex: 2 }}>
			<TimelineWrapper>
				<TimelineContainer ref={containerRef} onContextMenu={onContextMenu} $theme={theme}>
					<Box
						width={1}
						height={1}
						style={{ opacity }}
						sx={{ transition: 'opacity 0.3s', pointerEvents: 'none' }}
					>
						{opacity > 0 && (
							<>
								<TimelineTracks
									visible={!isSwitchingScale}
									scaleLevel={scaleLevel}
									containerWidth={containerWidth}
								/>
								<TimeMarker
									timestamp={selectedTime}
									scroll={scroll}
									scaleLevel={scaleLevel}
									transitioning={isSwitchingScale}
								/>
								<TimelineScaleLabel targetScaleIndex={targetScaleIndex} visible={isSwitchingScale} />
								<TimelineAnchor
									visible={!isSwitchingScale}
									scroll={scroll}
									scaleLevel={scaleLevel}
									containerWidth={containerWidth}
								/>
							</>
						)}
					</Box>
				</TimelineContainer>
				<TimelineControls />
			</TimelineWrapper>
			<TimelineZoomReporter />
		</Paper>
	)
}
