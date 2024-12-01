import { Paper } from '@mui/material'
import { useCallback, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { useEventBusDispatch, useEventBusSubscribe } from '@/app/features/eventBus'
import { getTimelinePreferences } from '@/app/features/preferences/selectors'
import { useTimelineWorldTime } from '@/app/features/time/hooks/useTimelineWorldTime'
import { useEffectOnce } from '@/app/utils/useEffectOnce'
import { useCustomTheme } from '@/hooks/useCustomTheme'
import { useWorldRouter } from '@/router/routes/worldRoutes'

import { useTimelineBusDispatch } from '../../hooks/useTimelineBus'
import { worldSlice } from '../../reducer'
import { getWorldState } from '../../selectors'
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
	const { lineSpacing } = useSelector(getTimelinePreferences)
	const theme = useCustomTheme()

	const { setSelectedTime } = worldSlice.actions
	const { setScaleLevel } = timelineSlice.actions
	const dispatch = useDispatch()
	const { navigateToOutliner } = useWorldRouter()

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
		const elements = document.querySelectorAll<HTMLElement>('.timeline-marker-scroll')
		if (elements) {
			elements.forEach((element) => {
				element.style.setProperty('--timeline-scroll', `${scroll}px`)
			})
		}
		notifyTimelineScrolled({
			scroll,
		})
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
		scrollTimelineTo(selectedTime)
	})

	return (
		<Paper>
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
						containerRef={containerRef}
						onNavigateToTime={scrollTimelineToTime}
						onZoomIn={scrollZoomIn}
						onZoomOut={scrollZoomOut}
					/>
					<TimelineTracks
						anotherRef={anotherRef}
						visible={!isSwitchingScale}
						lineSpacing={lineSpacing}
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
					></Paper>
					<TimelineAnchor
						visible={!isSwitchingScale}
						scroll={scroll}
						lineSpacing={lineSpacing}
						scaleLevel={scaleLevel}
						containerWidth={containerWidth}
					/>
					<TimelineGrabber />
				</TimelineContainer>
			</TimelineWrapper>
		</Paper>
	)
}
