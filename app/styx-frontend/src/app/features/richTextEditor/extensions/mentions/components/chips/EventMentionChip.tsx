import { useSelector } from 'react-redux'

import { useEventBusDispatch } from '@/app/features/eventBus'
import { getWorldState } from '@/app/views/world/WorldSliceSelectors'

import { BaseMentionChip } from './BaseMentionChip'

type Props = {
	worldId: string
	eventId: string
}

export const EventMentionChip = ({ eventId }: Props) => {
	const navigateTo = useEventBusDispatch['world/requestNavigation']()
	const { events } = useSelector(getWorldState, (a, b) => a.events === b.events)

	const event = events.find((event) => event.id === eventId)
	const eventName = event ? `${event.name}` : 'Unknown Event'
	const eventColor = event ? '#252' : undefined

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
