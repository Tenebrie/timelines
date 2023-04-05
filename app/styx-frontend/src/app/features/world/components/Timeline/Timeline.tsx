import { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { worldSlice } from '../../reducer'
import { useWorldRouter } from '../../router'
import { getWorldState } from '../../selectors'
import { TimelineAnchor } from './components/TimelineAnchor/TimelineAnchor'
import { TimelineEventGroup } from './components/TimelineEventGroup/TimelineEventGroup'
import { TimelineScaleLabel } from './components/TimelineScaleLabel/TimelineScaleLabel'
import { TimeMarker } from './components/TimeMarker/TimeMarker'
import useEventGroups from './hooks/useEventGroups'
import { useTimelineNavigation } from './hooks/useTimelineNavigation'
import { TimelineContainer, TimelineWrapper } from './styles'

export const Timeline = () => {
	const containerRef = useRef<HTMLDivElement | null>(null)

	const { events } = useSelector(getWorldState)

	const dispatch = useDispatch()
	const { openEventWizard } = worldSlice.actions

	const {
		navigateToCurrentWorld: navigateToCurrentWorldRoot,
		navigateToOutliner,
		outlinerParams,
		eventEditorParams,
	} = useWorldRouter()
	const selectedTime = Number(outlinerParams.timestamp)

	const onClick = (time: number) => {
		if (selectedTime === time) {
			navigateToCurrentWorldRoot()
		} else {
			navigateToOutliner(time)
		}
	}

	const onDoubleClick = (time: number) => {
		if (selectedTime) {
			dispatch(openEventWizard({ timestamp: time }))
		} else {
			navigateToOutliner(time)
		}
	}

	const { scroll, timelineScale, scaleLevel, targetScaleIndex, isSwitchingScale, scrollTo } =
		useTimelineNavigation({
			containerRef,
			defaultScroll: 150,
			maximumScroll: 500,
			scaleLimits: [-3, 10],
			onClick: (time) => onClick(time),
			onDoubleClick: (time) => onDoubleClick(time),
		})
	const eventGroups = useEventGroups({ timelineScale, scaleLevel })

	const lastSeenEventId = useRef<string | null>(null)
	useEffect(() => {
		if (eventEditorParams.eventId && eventEditorParams.eventId !== lastSeenEventId.current) {
			console.log('rerender')
			const event = events.find((e) => e.id === eventEditorParams.eventId)
			if (!event) {
				return
			}
			scrollTo(event.timestamp)
		}
		lastSeenEventId.current = eventEditorParams.eventId
	}, [eventEditorParams, events, scrollTo])

	return (
		<TimelineWrapper>
			<TimelineContainer ref={containerRef}>
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
					/>
				))}
			</TimelineContainer>
		</TimelineWrapper>
	)
}
