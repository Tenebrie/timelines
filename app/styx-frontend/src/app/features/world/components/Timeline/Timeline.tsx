import { useCallback, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { useTimelineWorldTime } from '../../../time/hooks/useTimelineWorldTime'
import { useTimelineBusDispatch } from '../../hooks/useTimelineBus'
import { useWorldRouter } from '../../router'
import { getTimelineContextMenuState, getWorldState } from '../../selectors'
import { TimelineAnchor } from './components/TimelineAnchor/TimelineAnchor'
import { useTimelineContextMenu } from './components/TimelineContextMenu/hooks/useTimelineContextMenu'
import { TimelineContextMenu } from './components/TimelineContextMenu/TimelineContextMenu'
import { TimelineEdgeScroll } from './components/TimelineEdgeScroll/TimelineEdgeScroll'
import { TimelineEventGroup } from './components/TimelineEventGroup/TimelineEventGroup'
import { TimelineScaleLabel } from './components/TimelineScaleLabel/TimelineScaleLabel'
import { TimelineSelectedLabel } from './components/TimelineSelectedLabel/TimelineSelectedLabel'
import { TimeMarker } from './components/TimeMarker/TimeMarker'
import useEventGroups from './hooks/useEventGroups'
import { useScrollToActiveEntity } from './hooks/useScrollToActiveEntity'
import { useTimelineDimensions } from './hooks/useTimelineDimensions'
import { useTimelineNavigation } from './hooks/useTimelineNavigation'
import { timelineSlice } from './reducer'
import { TimelineContainer, TimelineWrapper } from './styles'

export const Timeline = () => {
	const { timeOrigin, calendar } = useSelector(getWorldState)
	const contextMenuState = useSelector(getTimelineContextMenuState)

	const dispatch = useDispatch()
	const { setScaleLevel } = timelineSlice.actions

	const {
		navigateToCurrentWorld: navigateToCurrentWorldRoot,
		navigateToOutliner,
		navigateToEventCreator,
		selectedTimeOrNull,
		eventEditorParams,
		eventDeltaEditorParams,
		isLocationEqual,
	} = useWorldRouter()

	const scrollTimelineTo = useTimelineBusDispatch()

	const onClick = useCallback(
		(time: number) => {
			if (selectedTimeOrNull === time) {
				navigateToCurrentWorldRoot({ clearSelectedTime: true })
			} else {
				navigateToOutliner(time)
			}
		},
		[navigateToCurrentWorldRoot, navigateToOutliner, selectedTimeOrNull]
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
		[scrollTimelineTo, navigateToOutliner, navigateToEventCreator, selectedTimeOrNull]
	)

	const { containerRef, containerWidth } = useTimelineDimensions()

	const { scroll, timelineScale, scaleLevel, targetScaleIndex, isSwitchingScale } = useTimelineNavigation({
		containerRef,
		defaultScroll: Math.floor(containerWidth / 2) - Number(timeOrigin),
		maximumScroll: calendar === 'COUNTUP' ? Math.floor(containerWidth / 2) : Infinity,
		scaleLimits: [-3, 10],
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

	return (
		<TimelineWrapper>
			<TimelineContainer ref={containerRef} onContextMenu={onContextMenu}>
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
						eventEditorParams={eventEditorParams}
						eventDeltaEditorParams={eventDeltaEditorParams}
						contextMenuState={contextMenuState}
						realTimeToScaledTime={realTimeToScaledTime}
					/>
				))}
				<TimelineSelectedLabel onNavigateToTime={(time) => scrollTimelineTo(time)} />
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
