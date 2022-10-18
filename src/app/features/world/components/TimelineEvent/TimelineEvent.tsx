import React from 'react'

import { StoryEvent } from '../../types'
import { TimelineMarkerInfo } from '../TimelineMarkerInfo/TimelineMarkerInfo'
import { StoryEventMarkerOdd, StoryEventMarkerPointOdd } from './styles'

type Props = {
	event: StoryEvent
	offset: number
	scale: number
}

export const TimelineEvent = ({ event, offset, scale }: Props) => {
	const calculatedOffset = Math.floor(event.timestamp * scale + offset)

	return (
		<StoryEventMarkerOdd offset={calculatedOffset}>
			<StoryEventMarkerPointOdd />
			<TimelineMarkerInfo event={event} />
		</StoryEventMarkerOdd>
	)
}
