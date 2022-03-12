import React from 'react'

import { StoryEvent } from '../../types/StoryEvent'
import { TimelineMarkerInfo } from '../TimelineMarkerInfo/TimelineMarkerInfo'
import {
	StoryEventMarkerEven,
	StoryEventMarkerOdd,
	StoryEventMarkerPointEven,
	StoryEventMarkerPointOdd,
} from './styles'

export const TimelineEvent = (props: { event: StoryEvent; index: number; offset: number; scale: number }) => {
	const { event, scale, index } = props
	const offset = Math.floor(event.timestamp * scale + props.offset)
	const isEven = index % 2 === 0
	const isOdd = !isEven
	return (
		<div>
			{isOdd && (
				<StoryEventMarkerOdd offset={offset}>
					<StoryEventMarkerPointOdd />
					<TimelineMarkerInfo event={event} index={index} />
				</StoryEventMarkerOdd>
			)}
			{isEven && (
				<StoryEventMarkerEven offset={offset}>
					<StoryEventMarkerPointEven />
					<TimelineMarkerInfo event={event} index={index} />
				</StoryEventMarkerEven>
			)}
		</div>
	)
}
