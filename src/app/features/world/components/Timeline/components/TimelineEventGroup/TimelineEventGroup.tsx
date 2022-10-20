import { useState } from 'react'

import { StoryEventGroup } from '../../../../types'
import { TimelineEvent } from './components/TimelineEvent/TimelineEvent'
import { Group } from './styles'

type Props = {
	eventGroup: StoryEventGroup
	scroll: number
	pixelsPerTime: number
	visible: boolean
}

export const TimelineEventGroup = ({ eventGroup, scroll, pixelsPerTime, visible }: Props) => {
	const [isExpanded, setIsExpanded] = useState(false)

	const position = Math.floor(eventGroup.timestamp) / pixelsPerTime + scroll

	const onMouseEnter = () => {
		setIsExpanded(true)
	}

	const onMouseLeave = () => {
		setIsExpanded(false)
	}

	return (
		<Group
			position={position}
			onMouseEnter={onMouseEnter}
			onMouseLeave={onMouseLeave}
			className={visible ? 'visible' : ''}
		>
			{eventGroup.events.map((event, index) => (
				<TimelineEvent key={event.id} event={event} groupIndex={index} expanded={isExpanded} />
			))}
		</Group>
	)
}
