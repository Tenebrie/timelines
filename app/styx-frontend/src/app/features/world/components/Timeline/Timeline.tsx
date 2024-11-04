import { useCallback, useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { useWorldRouter } from '../../../../../router/routes/worldRoutes'
import { getTimelinePreferences, getUserPreferences } from '../../../preferences/selectors'
import { darkTheme, lightTheme } from '../../../theming/themes'
import { useTimelineBusDispatch } from '../../hooks/useTimelineBus'
import { getWorldState } from '../../selectors'
import { TimelineAnchor } from './components/TimelineAnchor/TimelineAnchor'
import { useTimelineContextMenu } from './components/TimelineContextMenu/hooks/useTimelineContextMenu'
import { TimelineContextMenu } from './components/TimelineContextMenu/TimelineContextMenu'
import { TimelineControls } from './components/TimelineControls/TimelineControls'
import { TimelineEdgeScroll } from './components/TimelineEdgeScroll/TimelineEdgeScroll'
import { TimelineGrabber } from './components/TimelineGrabber/TimelineGrabber'
import { TimelineScaleLabel } from './components/TimelineScaleLabel/TimelineScaleLabel'
import { TimelineTracks } from './components/TimelineTracks/TimelineTracks'
import { TimeMarker } from './components/TimeMarker/TimeMarker'
import { useContainerHeight } from './hooks/useContainerHeight'
import { useScrollToActiveEntity } from './hooks/useScrollToActiveEntity'
import { useTimelineDimensions } from './hooks/useTimelineDimensions'
import { useTimelineNavigation } from './hooks/useTimelineNavigation'
import { timelineSlice } from './reducer'
import { TimelineContainer, TimelineWrapper } from './styles'

export const Timeline = () => {
	const { timeOrigin } = useSelector(getWorldState)
	const { lineSpacing } = useSelector(getTimelinePreferences)
	const { colorMode } = useSelector(getUserPreferences)
	const theme = useMemo(() => (colorMode === 'light' ? lightTheme : darkTheme), [colorMode])

	const dispatch = useDispatch()
	const { setScaleLevel } = timelineSlice.actions

	const { navigateToOutliner, navigateToEventCreator, selectedTimeOrNull } = useWorldRouter()

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
				navigateToEventCreator()
				scrollTimelineTo(selectedTimeOrNull)
			}
		},
		[navigateToEventCreator, navigateToOutliner, scrollTimelineTo, selectedTimeOrNull],
	)

	const { containerRef, containerWidth } = useTimelineDimensions()

	const { scroll, timelineScale, scaleLevel, targetScaleIndex, isSwitchingScale, performZoom } =
		useTimelineNavigation({
			containerRef,
			defaultScroll: Math.floor(containerWidth / 2) - Number(timeOrigin),
			scaleLimits: [-1, 7],
			onClick: (time) => onClick(time),
			onDoubleClick: (time) => onDoubleClick(time),
		})

	useScrollToActiveEntity()

	useEffect(() => {
		dispatch(setScaleLevel(scaleLevel))
	}, [dispatch, scaleLevel, setScaleLevel])

	const { onContextMenu } = useTimelineContextMenu({
		scroll,
		scaleLevel,
		timelineScale,
	})

	const scrollTimelineToTime = useCallback((time: number) => scrollTimelineTo(time), [scrollTimelineTo])
	const scrollZoomIn = useCallback(() => performZoom(-1), [performZoom])
	const scrollZoomOut = useCallback(() => performZoom(1), [performZoom])

	const containerHeight = useContainerHeight()

	return (
		<TimelineWrapper>
			<TimelineContainer
				ref={containerRef}
				onContextMenu={onContextMenu}
				$height={containerHeight}
				style={{
					backgroundColor: theme.palette.background.paper,
				}}
			>
				<TimelineEdgeScroll
					side="left"
					currentScroll={scroll}
					pageSize={containerWidth}
					timelineScale={timelineScale}
					scaleLevel={scaleLevel}
					scrollTo={scrollTimelineTo}
				/>
				<TimelineTracks
					visible={!isSwitchingScale}
					scroll={scroll}
					lineSpacing={lineSpacing}
					scaleLevel={scaleLevel}
					timelineScale={timelineScale}
					containerWidth={containerWidth}
				/>
				<TimelineScaleLabel targetScaleIndex={targetScaleIndex} visible={isSwitchingScale} />
				<TimelineAnchor
					visible={!isSwitchingScale}
					scroll={scroll}
					lineSpacing={lineSpacing}
					timelineScale={timelineScale}
					scaleLevel={scaleLevel}
					containerWidth={containerWidth}
				/>
				{selectedTimeOrNull !== null && (
					<TimeMarker
						timestamp={selectedTimeOrNull}
						timelineScale={timelineScale}
						scroll={scroll}
						mode="mouse"
						scaleLevel={scaleLevel}
						transitioning={isSwitchingScale}
					/>
				)}
				<TimelineControls
					onNavigateToTime={scrollTimelineToTime}
					onZoomIn={scrollZoomIn}
					onZoomOut={scrollZoomOut}
				/>
				<TimelineGrabber />
				<TimelineEdgeScroll
					side="right"
					currentScroll={scroll}
					pageSize={containerWidth}
					timelineScale={timelineScale}
					scaleLevel={scaleLevel}
					scrollTo={scrollTimelineTo}
				/>
				<TimelineContextMenu />
			</TimelineContainer>
		</TimelineWrapper>
	)
}
