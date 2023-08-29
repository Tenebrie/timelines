import { useMemo } from 'react'
import { useSelector } from 'react-redux'

import { applyEventDelta } from '../../../../utils/applyEventDelta'
import { getWorldState } from '../../selectors'
import { WorldEvent } from '../../types'

type Props = {
	timestamp: number
	excludedEvents?: WorldEvent[]
	includeInactive?: boolean
}

export const useVisibleEvents = ({ timestamp, excludedEvents, includeInactive }: Props) => {
	const { events } = useSelector(getWorldState)

	const visibleEvents = useMemo(
		() =>
			events
				.filter(
					(event) =>
						event.timestamp <= timestamp &&
						!(excludedEvents ?? []).some((excludedEvent) => excludedEvent.id === event.id)
				)
				.map((event, index) => ({
					...event,
					index,
					active: event.revokedAt === undefined || event.revokedAt > timestamp,
				}))
				.filter((event) => includeInactive || event.active)
				.sort((a, b) => a.timestamp - b.timestamp || a.index - b.index)
				.map((event) => applyEventDelta({ event, timestamp })),
		[events, timestamp, excludedEvents, includeInactive]
	)

	return visibleEvents
}
