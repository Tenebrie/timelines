import { ThemeProvider } from '@mui/material'
import { useCallback, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { useWorldRouter, worldRoutes } from '../../../../../router/routes/worldRoutes'
import { darkTheme } from '../../../theming/themes'
import { useTimelineWorldTime } from '../../../time/hooks/useTimelineWorldTime'
import { useTimelineBusDispatch } from '../../hooks/useTimelineBus'
import { getTimelineContextMenuState, getWorldState } from '../../selectors'
import { TimelineAnchor } from './components/TimelineAnchor/TimelineAnchor'
import { useTimelineContextMenu } from './components/TimelineContextMenu/hooks/useTimelineContextMenu'
import { TimelineContextMenu } from './components/TimelineContextMenu/TimelineContextMenu'
import { TimelineControls } from './components/TimelineControls/TimelineControls'
import { TimelineEdgeScroll } from './components/TimelineEdgeScroll/TimelineEdgeScroll'
import { TimelineEventGroup } from './components/TimelineEventGroup/TimelineEventGroup'
import { TimelineGrabber } from './components/TimelineGrabber/TimelineGrabber'
import { TimelineScaleLabel } from './components/TimelineScaleLabel/TimelineScaleLabel'
import { TimeMarker } from './components/TimeMarker/TimeMarker'
import { useContainerHeight } from './hooks/useContainerHeight'
import useEventGroups from './hooks/useEventGroups'
import { useScrollToActiveEntity } from './hooks/useScrollToActiveEntity'
import { useTimelineDimensions } from './hooks/useTimelineDimensions'
import { useTimelineNavigation } from './hooks/useTimelineNavigation'
import { timelineSlice } from './reducer'
import { TimelineContainer, TimelineWrapper } from './styles'

export const Timeline = () => {
	const { timeOrigin } = useSelector(getWorldState)
	const contextMenuState = useSelector(getTimelineContextMenuState)

	const dispatch = useDispatch()
	const { setScaleLevel } = timelineSlice.actions

	const {
		navigateToCurrentWorldRoot,
		navigateToOutliner,
		navigateToEventCreator,
		stateOf,
		isLocationEqual,
		selectedTimeOrNull,
	} = useWorldRouter()
	const stateOfEventEditor = stateOf(worldRoutes.eventEditor)
	const stateOfDeltaEditor = stateOf(worldRoutes.eventDeltaEditor)

	const scrollTimelineTo = useTimelineBusDispatch()

	const onClick = useCallback(
		(time: number) => {
			if (selectedTimeOrNull === time) {
				navigateToCurrentWorldRoot()
			} else {
				navigateToOutliner(time)
			}
		},
		[selectedTimeOrNull, navigateToCurrentWorldRoot, navigateToOutliner],
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

	const eventGroups = useEventGroups({ timelineScale, scaleLevel })
	useScrollToActiveEntity()

	useEffect(() => {
		dispatch(setScaleLevel(scaleLevel))
	}, [dispatch, scaleLevel, setScaleLevel])

	const { realTimeToScaledTime } = useTimelineWorldTime({ scaleLevel })

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
			<ThemeProvider theme={darkTheme}>
				<TimelineContainer ref={containerRef} onContextMenu={onContextMenu} $height={containerHeight}>
					<TimelineEdgeScroll
						side="left"
						currentScroll={scroll}
						pageSize={containerWidth}
						timelineScale={timelineScale}
						scaleLevel={scaleLevel}
						scrollTo={scrollTimelineTo}
					/>
					<TimelineScaleLabel targetScaleIndex={targetScaleIndex} visible={isSwitchingScale} />
					<TimelineAnchor
						visible={!isSwitchingScale}
						scroll={scroll}
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
					{eventGroups.map((group) => (
						<TimelineEventGroup
							key={group.timestamp}
							visible={!isSwitchingScale}
							scroll={scroll}
							eventGroup={group}
							timelineScale={timelineScale}
							containerWidth={containerWidth}
							isLocationEqual={isLocationEqual}
							eventEditorParams={stateOfEventEditor}
							eventDeltaEditorParams={stateOfDeltaEditor}
							contextMenuState={contextMenuState}
							realTimeToScaledTime={realTimeToScaledTime}
						/>
					))}
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
			</ThemeProvider>
		</TimelineWrapper>
	)
}
