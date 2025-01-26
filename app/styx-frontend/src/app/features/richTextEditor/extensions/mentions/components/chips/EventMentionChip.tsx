import { useSelector } from 'react-redux'

import { useEventBusDispatch } from '@/app/features/eventBus'
import { getWorldState } from '@/app/features/world/selectors'
import { worldTimelineRoutes } from '@/router/routes/featureRoutes/worldTimelineRoutes'
import { QueryParams } from '@/router/routes/QueryParams'
import { QueryStrategy } from '@/router/types'

import { BaseMentionChip } from './BaseMentionChip'

type Props = {
	eventId: string
}

export const EventMentionChip = ({ eventId }: Props) => {
	const { id: worldId, events } = useSelector(getWorldState, (a, b) => a.id === b.id && a.events === b.events)
	const navigateTo = useEventBusDispatch({
		event: 'navigate/worldTimeline',
	})

	const event = events.find((event) => event.id === eventId)
	const eventName = event ? `${event.name}` : '@Unknown Event'
	const eventColor = event ? '#252' : undefined

	return (
		<BaseMentionChip
			type="Event"
			label={eventName}
			color={eventColor}
			onClick={() => {
				navigateTo({
					target: worldTimelineRoutes.eventEditor,
					args: { worldId, eventId },
					query: { [QueryParams.SELECTED_TIME]: QueryStrategy.Preserve },
				})
			}}
		/>
	)
}
