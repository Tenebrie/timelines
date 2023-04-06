import { useState } from 'react'

import { useStatementEditorData } from '../../../../../../../hooks/useStatementEditorData'
import { useTimelineWorldTime } from '../../../../../time/hooks/useTimelineWorldTime'
import { WorldEventGroup } from '../../../../types'
import { ScaleLevel } from '../../types'
import { TimelineEvent } from './components/TimelineEvent/TimelineEvent'
import { Group } from './styles'

type Props = {
	eventGroup: WorldEventGroup
	scroll: number
	timelineScale: number
	scaleLevel: ScaleLevel
	visible: boolean
	containerWidth: number
}

export const TimelineEventGroup = ({
	eventGroup,
	scroll,
	timelineScale,
	scaleLevel,
	visible,
	containerWidth,
}: Props) => {
	const [isHovered, setIsHovered] = useState(false)

	const { realTimeToScaledTime } = useTimelineWorldTime({ scaleLevel })
	const { issuedByEvent, revokedByEvent } = useStatementEditorData()

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
		(event) => event.id === issuedByEvent?.id || event.id === revokedByEvent?.id
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
					key={event.id}
					event={event}
					groupIndex={index}
					expanded={isExpanded}
					highlighted={highlightedEvents.includes(event)}
				/>
			))}
		</Group>
	)
}
