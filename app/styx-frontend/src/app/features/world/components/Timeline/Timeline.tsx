import { useCallback, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { worldSlice } from '../../reducer'
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
import { TimelineContainer, TimelineWrapper } from './styles'

export const Timeline = () => {
	const containerRef = useRef<HTMLDivElement | null>(null)
	const containerWidth = useRef<number>(window.innerWidth)

	const { events, timeOrigin, calendar } = useSelector(getWorldState)

	const dispatch = useDispatch()
	const { openEventWizard, setTimelineScaleLevel } = worldSlice.actions

	const {
		navigateToCurrentWorld: navigateToCurrentWorldRoot,
		navigateToOutliner,
		selectedTimeOrNull,
		eventEditorParams,
	} = useWorldRouter()

	const onClick = useCallback(
		(time: number) => {
			if (selectedTimeOrNull === time) {
				navigateToCurrentWorldRoot()
			} else {
				navigateToOutliner(time)
			}
		},
		[navigateToCurrentWorldRoot, navigateToOutliner, selectedTimeOrNull]
	)

	const onDoubleClick = useCallback(
		(time: number) => {
			if (Number.isNaN(selectedTimeOrNull)) {
				navigateToOutliner(time)
			} else {
				dispatch(openEventWizard({ timestamp: time }))
			}
		},
		[dispatch, navigateToOutliner, openEventWizard, selectedTimeOrNull]
	)

	useEffect(() => {
		if (!containerRef.current) {
			return
		}
		containerWidth.current = containerRef.current.getBoundingClientRect().width
	}, [containerRef])

	const { scroll, timelineScale, scaleLevel, targetScaleIndex, isSwitchingScale, scrollTo } =
		useTimelineNavigation({
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
			scrollTo(event.timestamp)
		}
		lastSeenEventId.current = eventEditorParams.eventId
	}, [eventEditorParams, events, scrollTo])

	useEffect(() => {
		dispatch(setTimelineScaleLevel(scaleLevel))
	}, [dispatch, scaleLevel, setTimelineScaleLevel])

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
					scrollTo={scrollTo}
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
				<TimelineSelectedLabel onNavigateToTime={(time) => scrollTo(time)} />
				<TimelineEdgeScroll
					side="right"
					currentScroll={scroll}
					pageSize={scrollPageSize}
					timelineScale={timelineScale}
					scaleLevel={scaleLevel}
					scrollTo={scrollTo}
				/>
			</TimelineContainer>
		</TimelineWrapper>
	)
}
