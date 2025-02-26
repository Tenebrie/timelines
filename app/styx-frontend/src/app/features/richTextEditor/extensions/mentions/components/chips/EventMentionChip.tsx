import { useEventBusDispatch } from '@/app/features/eventBus'
import { getWorldState } from '@/app/views/world/WorldSliceSelectors'

import { BaseMentionChip } from './BaseMentionChip'

type Props = {
	worldId: string
	eventId: string
	events: ReturnType<typeof getWorldState>['events']
}

export const EventMentionChip = ({ worldId, eventId, events }: Props) => {
	const navigateTo = useEventBusDispatch({
		event: 'navigate/world',
	})

	const event = events.find((event) => event.id === eventId)
	const eventName = event ? `${event.name}` : 'Unknown Event'
	const eventColor = event ? '#252' : undefined

	const onClick = () => {
		if (!event) {
			return
		}

		navigateTo({
			to: '/world/$worldId/timeline',
			params: { worldId },
			search: (prev) => ({ ...prev, selection: [`issuedAt-${eventId}`] }),
		})
	}

	return <BaseMentionChip type="Event" label={eventName} color={eventColor} onClick={onClick} />
}
