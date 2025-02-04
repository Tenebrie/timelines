import { useEventBusDispatch } from '@/app/features/eventBus'
import { getWorldState } from '@/app/features/world/selectors'
import { worldTimelineRoutes } from '@/router/routes/featureRoutes/worldTimelineRoutes'
import { QueryParams } from '@/router/routes/QueryParams'
import { QueryStrategy } from '@/router/types'

import { BaseMentionChip } from './BaseMentionChip'

type Props = {
	worldId: string
	eventId: string
	events: ReturnType<typeof getWorldState>['events']
}

export const EventMentionChip = ({ worldId, eventId, events }: Props) => {
	const navigateTo = useEventBusDispatch({
		event: 'navigate/worldTimeline',
	})

	const event = events.find((event) => event.id === eventId)
	const eventName = event ? `${event.name}` : 'Unknown Event'
	const eventColor = event ? '#252' : undefined

	const onClick = () => {
		if (!event) {
			return
		}

		navigateTo({
			target: worldTimelineRoutes.eventEditor,
			args: { worldId, eventId },
			query: { [QueryParams.SELECTED_TIME]: QueryStrategy.Preserve },
		})
	}

	return <BaseMentionChip type="Event" label={eventName} color={eventColor} onClick={onClick} />
}
