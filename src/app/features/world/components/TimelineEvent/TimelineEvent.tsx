import { StoryEvent } from '../../types'
import { TimelineMarkerInfo } from '../TimelineMarkerInfo/TimelineMarkerInfo'
import { Marker } from './styles'

type Props = {
	event: StoryEvent
	offset: number
}

export const TimelineEvent = ({ event, offset }: Props) => {
	const calculatedOffset = Math.floor(event.timestamp + offset)

	return (
		<Marker offset={calculatedOffset}>
			<TimelineMarkerInfo event={event} />
		</Marker>
	)
}
