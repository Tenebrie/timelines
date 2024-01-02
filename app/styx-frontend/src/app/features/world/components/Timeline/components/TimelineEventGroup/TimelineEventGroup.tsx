import { useState } from 'react'

import { useWorldRouter } from '../../../../../../../router/routes/worldRoutes'
import { useTimelineWorldTime } from '../../../../../time/hooks/useTimelineWorldTime'
import { getTimelineContextMenuState } from '../../../../selectors'
import { WorldEventGroup } from '../../../../types'
import { TimelineEvent } from './components/TimelineEvent/TimelineEvent'
import { Group } from './styles'

type Props = {
	eventGroup: WorldEventGroup
	scroll: number
	timelineScale: number
	visible: boolean
	containerWidth: number
	isLocationEqual: ReturnType<typeof useWorldRouter>['isLocationEqual']
	eventEditorParams: {
		eventId: string
	}
	eventDeltaEditorParams: {
		deltaId: string
	}
	contextMenuState: ReturnType<typeof getTimelineContextMenuState>
	realTimeToScaledTime: ReturnType<typeof useTimelineWorldTime>['realTimeToScaledTime']
}

export const TimelineEventGroup = ({
	eventGroup,
	scroll,
	timelineScale,
	visible,
	containerWidth,
	isLocationEqual,
	eventEditorParams,
	eventDeltaEditorParams,
	contextMenuState,
	realTimeToScaledTime,
}: Props) => {
	const [isHovered, setIsHovered] = useState(false)

	const position = realTimeToScaledTime(Math.floor(eventGroup.timestamp) / timelineScale) + scroll

	if (position < -100 || position > containerWidth + 100) {
		return <></>
	}

	const onMouseEnter = () => {
		setIsHovered(true)
	}

	const onMouseLeave = () => {
		setIsHovered(false)
	}

	const highlightedEvents = eventGroup.events.filter(
		(entity) =>
			(isLocationEqual('/world/:worldId/editor/:eventId') && eventEditorParams.eventId === entity.id) ||
			(isLocationEqual('/world/:worldId/editor/:eventId/delta/:deltaId') &&
				eventDeltaEditorParams.deltaId === entity.id) ||
			(contextMenuState.isOpen && contextMenuState.selectedEvent?.id === entity.id)
	)

	const isExpanded = isHovered || highlightedEvents.length > 0

	return (
		<Group
			position={position}
			onMouseEnter={onMouseEnter}
			onMouseLeave={onMouseLeave}
			className={`${visible ? 'visible' : ''} ${isExpanded ? 'expanded' : ''}`}
		>
			{eventGroup.events.map((event, index) => (
				<TimelineEvent
					key={event.key}
					entity={event}
					groupIndex={index}
					expanded={isExpanded}
					highlighted={highlightedEvents.includes(event)}
				/>
			))}
		</Group>
	)
}
