import { useState } from 'react'

import { StoryEventGroup } from '../../../../types'
import { TimelineEvent } from './components/TimelineEvent/TimelineEvent'
import { Group } from './styles'

type Props = {
	eventGroup: StoryEventGroup
	scroll: number
	timePerPixel: number
	visible: boolean
}

export const TimelineEventGroup = ({ eventGroup, scroll, timePerPixel, visible }: Props) => {
	const [isExpanded, setIsExpanded] = useState(false)

	const position = Math.floor(eventGroup.timestamp) / timePerPixel + scroll

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
