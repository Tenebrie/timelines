import React from 'react'

import { StoryEvent } from '../../types/StoryEvent'
import {
	StoryEventMarkerInfoContainerEven,
	StoryEventMarkerInfoContainerOdd,
	StoryEventMarkerInfoText,
} from './styles'

export const TimelineMarkerInfo = (props: { event: StoryEvent; index: number }) => {
	const { event, index } = props
	const isEven = index % 2 === 0
	const isOdd = !isEven
	return (
		<div>
			{isOdd && (
				<StoryEventMarkerInfoContainerOdd>
					<StoryEventMarkerInfoText>{event.name}</StoryEventMarkerInfoText>
				</StoryEventMarkerInfoContainerOdd>
			)}
			{isEven && (
				<StoryEventMarkerInfoContainerEven>
					<StoryEventMarkerInfoText>{event.name}</StoryEventMarkerInfoText>
				</StoryEventMarkerInfoContainerEven>
			)}
		</div>
	)
}
