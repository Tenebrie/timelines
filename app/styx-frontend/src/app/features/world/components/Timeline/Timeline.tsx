import { Paper } from '@mui/material'
import { useCallback, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { useEventBusSubscribe } from '@/app/features/eventBus'
import { getTimelinePreferences } from '@/app/features/preferences/selectors'
import { useTimelineWorldTime } from '@/app/features/time/hooks/useTimelineWorldTime'
import { useCustomTheme } from '@/hooks/useCustomTheme'
import { useWorldRouter } from '@/router/routes/worldRoutes'

import { useTimelineBusDispatch } from '../../hooks/useTimelineBus'
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
	const { timeOrigin } = useSelector(getWorldState)
	const { lineSpacing } = useSelector(getTimelinePreferences)
	const theme = useCustomTheme()

	const dispatch = useDispatch()
	const { setScaleLevel } = timelineSlice.actions

	const { navigateToOutliner, selectedTimeOrNull } = useWorldRouter()

	const scrollTimelineTo = useTimelineBusDispatch()

	const onClick = useCallback(
		(time: number) => {
			navigateToOutliner(time)
		},
		[navigateToOutliner],
	)

	const onDoubleClick = useCallback(
		(time: number) => {
			if (selectedTimeOrNull === null) {
				navigateToOutliner(time)
			} else {
				scrollTimelineTo(time)
			}
		},
		[navigateToOutliner, scrollTimelineTo, selectedTimeOrNull],
	)

	const { containerRef, containerWidth } = useTimelineDimensions()
	const anotherRef = useRef<HTMLDivElement | null>(null)

	const { scroll, scaleLevel, targetScaleIndex, isSwitchingScale, performZoom } = useTimelineNavigation({
		containerRef: [containerRef, anotherRef],
		defaultScroll: Math.floor(containerWidth / 2) - Number(timeOrigin),
		scaleLimits: [-1, 7],
		selectedTime: selectedTimeOrNull,
		onClick: (time) => onClick(time),
		onDoubleClick: (time) => onDoubleClick(time),
	})

	// useScrollToActiveEntity()

	useEffect(() => {
		dispatch(setScaleLevel(scaleLevel))
	}, [dispatch, scaleLevel, setScaleLevel])

	const { onContextMenu } = useTimelineContextMenu({
		scroll,
		scaleLevel,
	})

	useEffect(() => {
		TimelineState.scroll = scroll
	}, [scroll])

	const scrollTimelineToTime = useCallback((time: number) => scrollTimelineTo(time), [scrollTimelineTo])
	const scrollZoomIn = useCallback(() => performZoom(-1), [performZoom])
	const scrollZoomOut = useCallback(() => performZoom(1), [performZoom])

	const { scaledTimeToRealTime } = useTimelineWorldTime({ scaleLevel })
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
						scroll={scroll}
						lineSpacing={lineSpacing}
						scaleLevel={scaleLevel}
						containerWidth={containerWidth}
					/>
					<TimelineScaleLabel targetScaleIndex={targetScaleIndex} visible={isSwitchingScale} />
					<TimelineAnchor
						visible={!isSwitchingScale}
						scroll={scroll}
						lineSpacing={lineSpacing}
						scaleLevel={scaleLevel}
						containerWidth={containerWidth}
					/>
					{selectedTimeOrNull !== null && (
						<TimeMarker
							timestamp={selectedTimeOrNull}
							scroll={scroll}
							mode="mouse"
							scaleLevel={scaleLevel}
							transitioning={isSwitchingScale}
						/>
					)}
					<TimelineGrabber />
				</TimelineContainer>
			</TimelineWrapper>
		</Paper>
	)
}
