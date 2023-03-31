import { useState } from 'react'

import { useTimelineWorldTime } from '../../../../../time/hooks/useTimelineWorldTime'
import { StoryEventGroup } from '../../../../types'
import { ScaleLevel } from '../../types'
import { TimelineEvent } from './components/TimelineEvent/TimelineEvent'
import { Group } from './styles'

type Props = {
	eventGroup: StoryEventGroup
	scroll: number
	timelineScale: number
	scaleLevel: ScaleLevel
	visible: boolean
}

export const TimelineEventGroup = ({ eventGroup, scroll, timelineScale, scaleLevel, visible }: Props) => {
	const [isExpanded, setIsExpanded] = useState(false)

	const { realTimeToScaledTime } = useTimelineWorldTime({ scaleLevel })

	const position = realTimeToScaledTime(Math.floor(eventGroup.timestamp) / timelineScale) + scroll

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
