import Paper from '@mui/material/Paper'
import { useNavigate } from '@tanstack/react-router'
import { memo, useCallback, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { useEventBusDispatch, useEventBusSubscribe } from '@/app/features/eventBus'
import { useTimelineWorldTime } from '@/app/features/time/hooks/useTimelineWorldTime'
import { getWorldState } from '@/app/features/world/selectors'
import { useCustomTheme } from '@/app/hooks/useCustomTheme'
import { useEffectOnce } from '@/app/utils/useEffectOnce'

import { TimelineAnchor } from './components/TimelineAnchor/TimelineAnchor'
import { useTimelineContextMenu } from './components/TimelineContextMenu/hooks/useTimelineContextMenu'
import { TimelineGrabber } from './components/TimelineGrabber/TimelineGrabber'
import { TimelineScaleLabel } from './components/TimelineScaleLabel/TimelineScaleLabel'
import { TimelineTracks } from './components/TimelineTracks/TimelineTracks'
import { TimelineZoomReporter } from './components/TimelineZoomReporter'
import { TimeMarker } from './components/TimeMarker/TimeMarker'
import { useContainerHeight } from './hooks/useContainerHeight'
import { useTimelineDimensions } from './hooks/useTimelineDimensions'
import { useTimelineNavigation } from './hooks/useTimelineNavigation'
import { timelineSlice } from './reducer'
import { TimelineContainer, TimelineWrapper } from './styles'
import { TimelineState } from './utils/TimelineState'

export const Timeline = memo(TimelineComponent)

function TimelineComponent() {
	const { timeOrigin, calendar, selectedTime } = useSelector(
		getWorldState,
		(a, b) => a.selectedTime === b.selectedTime && a.calendar === b.calendar && a.timeOrigin === b.timeOrigin,
	)
	const theme = useCustomTheme()

	const { setScaleLevel } = timelineSlice.actions
	const dispatch = useDispatch()
	const navigate = useNavigate({ from: '/world/$worldId/timeline' })

	const scrollTimelineTo = useEventBusDispatch({ event: 'scrollTimelineTo' })

	const onClick = useCallback(
		(time: number) => {
			navigate({
				to: '/world/$worldId/timeline/outliner',
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
	const anotherRef = useRef<HTMLDivElement | null>(null)

	const { scroll, scaleLevel, targetScaleIndex, isSwitchingScale } = useTimelineNavigation({
		containerRef: [containerRef, anotherRef],
		defaultScroll: Math.floor(containerWidth / 2) - Number(timeOrigin),
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

	const containerHeight = useContainerHeight()

	useEffectOnce(() => {
		scrollTimelineTo({
			timestamp: selectedTime,
			skipAnim: true,
		})
	})

	return (
		<Paper sx={{ height: '100%', borderRadius: 0, zIndex: 2 }}>
			<TimelineWrapper>
				<TimelineContainer
					ref={containerRef}
					onContextMenu={onContextMenu}
					$theme={theme}
					$height={containerHeight}
					style={{
						backgroundColor: theme.custom.palette.background.timeline,
					}}
				>
					<TimelineTracks
						anotherRef={anotherRef}
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
					{/* <Paper
						elevation={4}
						style={{
							position: 'absolute',
							bottom: '-32px',
							height: '32px',
							width: '100vw',
						}}
						sx={{ backgroundColor: theme.custom.palette.background.timelineHeader }}
					></Paper> */}
					<TimelineAnchor
						visible={!isSwitchingScale}
						scroll={scroll}
						scaleLevel={scaleLevel}
						containerWidth={containerWidth}
					/>
					<TimelineGrabber />
				</TimelineContainer>
				{/* <TimelineControls onZoomIn={scrollZoomIn} onZoomOut={scrollZoomOut} /> */}
			</TimelineWrapper>
			<TimelineZoomReporter />
		</Paper>
	)
}
