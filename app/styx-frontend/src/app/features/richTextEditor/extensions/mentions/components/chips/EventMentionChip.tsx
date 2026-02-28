import { useSelector } from 'react-redux'

import { useEventBusDispatch } from '@/app/features/eventBus'
import { useEntityColor } from '@/app/utils/colors/useEntityColor'
import { getWorldState } from '@/app/views/world/WorldSliceSelectors'

import { BaseMentionChip } from './BaseMentionChip'

type Props = {
	worldId: string
	eventId: string
	fallbackName?: string
}

export const EventMentionChip = ({ eventId, fallbackName }: Props) => {
	const navigateTo = useEventBusDispatch['world/requestNavigation']()
	const { events } = useSelector(getWorldState, (a, b) => a.events === b.events)

	const event = events.find((event) => event.id === eventId)
	const eventName = event ? `${event.name}` : `Deleted Event (${fallbackName ?? 'Unknown'})`
	const eventColor = useEntityColor({ id: eventId, color: event?.color })

	const onClick = () => {
		if (!event) {
			return
		}
		navigateTo({
			search: (prev) => {
				const navi = [...(prev.navi ?? [])] as string[]
				if (navi.length === 0 || !navi[navi.length - 1].includes(eventId)) {
					navi.push(eventId)
				}
				return { ...prev, navi }
			},
		})
	}

	return <BaseMentionChip type="Event" label={eventName} color={eventColor} onClick={onClick} />
}
