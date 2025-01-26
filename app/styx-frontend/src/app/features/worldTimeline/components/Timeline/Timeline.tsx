import Paper from '@mui/material/Paper'
import { useCallback, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { useEventBusDispatch, useEventBusSubscribe } from '@/app/features/eventBus'
import { useTimelineWorldTime } from '@/app/features/time/hooks/useTimelineWorldTime'
import { worldSlice } from '@/app/features/world/reducer'
import { getWorldState } from '@/app/features/world/selectors'
import { useEffectOnce } from '@/app/utils/useEffectOnce'
import { useCustomTheme } from '@/hooks/useCustomTheme'
import { useWorldTimelineRouter } from '@/router/routes/featureRoutes/worldTimelineRoutes'

import { useTimelineBusDispatch } from '../../hooks/useTimelineBus'
import { TimelineAnchor } from './components/TimelineAnchor/TimelineAnchor'
import { useTimelineContextMenu } from './components/TimelineContextMenu/hooks/useTimelineContextMenu'
import { TimelineControls } from './components/TimelineControls/TimelineControls'
import { TimelineGrabber } from './components/TimelineGrabber/TimelineGrabber'
import { TimelineScaleLabel } from './components/TimelineScaleLabel/TimelineScaleLabel'
import { TimelineTracks } from './components/TimelineTracks/TimelineTracks'
import { TimeMarker } from './components/TimeMarker/TimeMarker'
import { useContainerHeight } from './hooks/useContainerHeight'
import { useTimelineDimensions } from './hooks/useTimelineDimensions'
import { useTimelineNavigation } from './hooks/useTimelineNavigation'
import { timelineSlice } from './reducer'
import { TimelineContainer, TimelineWrapper } from './styles'
import { TimelineState } from './utils/TimelineState'

export const Timeline = () => {
	const { timeOrigin, calendar, selectedTime } = useSelector(getWorldState)
	const theme = useCustomTheme()

	const { setSelectedTime } = worldSlice.actions
	const { setScaleLevel } = timelineSlice.actions
	const dispatch = useDispatch()
	const { navigateToOutliner } = useWorldTimelineRouter()

	const scrollTimelineTo = useTimelineBusDispatch()

	const onClick = useCallback(
		(time: number) => {
			navigateToOutliner()
			dispatch(setSelectedTime(time))
		},
		[dispatch, setSelectedTime, navigateToOutliner],
	)

	const onDoubleClick = useCallback(
		(time: number) => {
			scrollTimelineTo(time)
		},
		[scrollTimelineTo],
	)

	const { containerRef, containerWidth } = useTimelineDimensions()
	const anotherRef = useRef<HTMLDivElement | null>(null)

	const { scroll, scaleLevel, targetScaleIndex, isSwitchingScale, performZoom } = useTimelineNavigation({
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

	const scrollTimelineToTime = useCallback((time: number) => scrollTimelineTo(time), [scrollTimelineTo])
	const scrollZoomIn = useCallback(() => performZoom(-1), [performZoom])
	const scrollZoomOut = useCallback(() => performZoom(1), [performZoom])

	const { scaledTimeToRealTime } = useTimelineWorldTime({ scaleLevel, calendar })
	const onScrollFullPage = useCallback(
		(side: 'left' | 'right') => {
			const currentTimestamp = scaledTimeToRealTime(-scroll)
			const sideScalar = side === 'left' ? -1 : 1
			scrollTimelineToTime(
				currentTimestamp + scaledTimeToRealTime(containerWidth * sideScalar + containerWidth / 2),
			)
		},
		[scaledTimeToRealTime, scroll, scrollTimelineToTime, containerWidth],
	)
	useEventBusSubscribe({ event: 'scrollTimelineLeft', callback: () => onScrollFullPage('left') })
	useEventBusSubscribe({ event: 'scrollTimelineRight', callback: () => onScrollFullPage('right') })

	const containerHeight = useContainerHeight()

	useEffectOnce(() => {
		scrollTimelineTo(selectedTime, false, true)
	})

	return (
		<Paper style={{ zIndex: 2 }}>
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
					<TimelineControls
						onNavigateToTime={scrollTimelineToTime}
						onZoomIn={scrollZoomIn}
						onZoomOut={scrollZoomOut}
					/>
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
					<Paper
						elevation={4}
						style={{
							position: 'absolute',
							bottom: '-32px',
							height: '32px',
							width: '100vw',
						}}
						sx={{ backgroundColor: theme.custom.palette.background.timelineHeader }}
					></Paper>
					<TimelineAnchor
						visible={!isSwitchingScale}
						scroll={scroll}
						scaleLevel={scaleLevel}
						containerWidth={containerWidth}
					/>
					<TimelineGrabber />
				</TimelineContainer>
			</TimelineWrapper>
		</Paper>
	)
}
