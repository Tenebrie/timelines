import { useCallback, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { worldSlice } from '../../reducer'
import { useWorldRouter } from '../../router'
import { getWorldState } from '../../selectors'
import { TimelineAnchor } from './components/TimelineAnchor/TimelineAnchor'
import { TimelineEdgeScroll } from './components/TimelineEdgeScroll/TimelineEdgeScroll'
import { TimelineEventGroup } from './components/TimelineEventGroup/TimelineEventGroup'
import { TimelineScaleLabel } from './components/TimelineScaleLabel/TimelineScaleLabel'
import { TimeMarker } from './components/TimeMarker/TimeMarker'
import useEventGroups from './hooks/useEventGroups'
import { useTimelineNavigation } from './hooks/useTimelineNavigation'
import { TimelineContainer, TimelineWrapper } from './styles'

export const Timeline = () => {
	const containerRef = useRef<HTMLDivElement | null>(null)
	const containerWidth = useRef<number>(window.innerWidth)

	const { events, timeOrigin } = useSelector(getWorldState)

	const dispatch = useDispatch()
	const { openEventWizard } = worldSlice.actions

	const {
		navigateToCurrentWorld: navigateToCurrentWorldRoot,
		navigateToOutliner,
		outlinerParams,
		eventEditorParams,
	} = useWorldRouter()
	const selectedTime = Number(outlinerParams.timestamp)

	const onClick = useCallback(
		(time: number) => {
			if (selectedTime === time) {
				navigateToCurrentWorldRoot()
			} else {
				navigateToOutliner(time)
			}
		},
		[navigateToCurrentWorldRoot, navigateToOutliner, selectedTime]
	)

	const onDoubleClick = useCallback(
		(time: number) => {
			if (selectedTime) {
				dispatch(openEventWizard({ timestamp: time }))
			} else {
				navigateToOutliner(time)
			}
		},
		[dispatch, navigateToOutliner, openEventWizard, selectedTime]
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
			defaultScroll: Math.floor(containerWidth.current / 2) - timeOrigin,
			maximumScroll: Infinity,
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
				{!isNaN(selectedTime) && (
					<TimeMarker
						timestamp={selectedTime}
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
