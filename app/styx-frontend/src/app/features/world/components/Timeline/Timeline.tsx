import { useCallback, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { useTimelineBusDispatch } from '../../hooks/useTimelineBus'
import { useWorldRouter } from '../../router'
import { getWorldState } from '../../selectors'
import { TimelineAnchor } from './components/TimelineAnchor/TimelineAnchor'
import { TimelineEdgeScroll } from './components/TimelineEdgeScroll/TimelineEdgeScroll'
import { TimelineEventGroup } from './components/TimelineEventGroup/TimelineEventGroup'
import { TimelineScaleLabel } from './components/TimelineScaleLabel/TimelineScaleLabel'
import { TimelineSelectedLabel } from './components/TimelineSelectedLabel/TimelineSelectedLabel'
import { TimeMarker } from './components/TimeMarker/TimeMarker'
import useEventGroups from './hooks/useEventGroups'
import { useTimelineNavigation } from './hooks/useTimelineNavigation'
import { timelineSlice } from './reducer'
import { TimelineContainer, TimelineWrapper } from './styles'

export const Timeline = () => {
	const containerRef = useRef<HTMLDivElement | null>(null)
	const containerWidth = useRef<number>(window.innerWidth)

	const { events, timeOrigin, calendar } = useSelector(getWorldState)

	const dispatch = useDispatch()
	const { setScaleLevel } = timelineSlice.actions

	const {
		navigateToCurrentWorld: navigateToCurrentWorldRoot,
		navigateToOutliner,
		navigateToEventCreator,
		selectedTimeOrNull,
		eventEditorParams,
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

	useEffect(() => {
		if (!containerRef.current) {
			return
		}
		containerWidth.current = containerRef.current.getBoundingClientRect().width
	}, [containerRef])

	const { scroll, timelineScale, scaleLevel, targetScaleIndex, isSwitchingScale } = useTimelineNavigation({
		containerRef,
		defaultScroll: Math.floor(containerWidth.current / 2) - Number(timeOrigin),
		maximumScroll: calendar === 'COUNTUP' ? Math.floor(containerWidth.current / 2) : Infinity,
		scaleLimits: [-3, 10],
		onClick: (time) => onClick(time),
		onDoubleClick: (time) => onDoubleClick(time),
	})
	const eventGroups = useEventGroups({ timelineScale, scaleLevel })

	const lastSeenEventId = useRef<string | null>(null)
	useEffect(() => {
		if (eventEditorParams.eventId && eventEditorParams.eventId !== lastSeenEventId.current) {
			const event = events.find((e) => e.id === eventEditorParams.eventId)
			if (!event) {
				return
			}
			scrollTimelineTo(event.timestamp)
		}
		lastSeenEventId.current = eventEditorParams.eventId
	}, [eventEditorParams, events, scrollTimelineTo])

	useEffect(() => {
		dispatch(setScaleLevel(scaleLevel))
	}, [dispatch, scaleLevel, setScaleLevel])

	const scrollPageSize = containerWidth.current

	return (
		<TimelineWrapper>
			<TimelineContainer ref={containerRef}>
				<TimelineEdgeScroll
					side="left"
					currentScroll={scroll}
					pageSize={scrollPageSize}
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
						scaleLevel={scaleLevel}
						containerWidth={containerWidth.current}
					/>
				))}
				<TimelineSelectedLabel onNavigateToTime={(time) => scrollTimelineTo(time)} />
				<TimelineEdgeScroll
					side="right"
					currentScroll={scroll}
					pageSize={scrollPageSize}
					timelineScale={timelineScale}
					scaleLevel={scaleLevel}
					scrollTo={scrollTimelineTo}
				/>
			</TimelineContainer>
		</TimelineWrapper>
	)
}
