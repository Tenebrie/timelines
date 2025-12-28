import { useEventBusDispatch } from '@/app/features/eventBus'
import { useModal } from '@/app/features/modals/ModalsSlice'
import { getWorldState } from '@/app/views/world/WorldSliceSelectors'

import { BaseMentionChip } from './BaseMentionChip'

type Props = {
	worldId: string
	eventId: string
	events: ReturnType<typeof getWorldState>['events']
}

export const EventMentionChip = ({ worldId, eventId, events }: Props) => {
	const navigateTo = useEventBusDispatch({
		event: 'world/requestNavigation',
	})
	const { open: openEditEventModal } = useModal('editEventModal')

	const event = events.find((event) => event.id === eventId)
	const eventName = event ? `${event.name}` : 'Unknown Event'
	const eventColor = event ? '#252' : undefined

	const onClick = () => {
		if (!event) {
			return
		}
		navigateTo({
			search: (prev) => ({ ...prev, selection: [eventId] }),
		})
		openEditEventModal({ eventId: event.id })
	}

	return <BaseMentionChip type="Event" label={eventName} color={eventColor} onClick={onClick} />
}
