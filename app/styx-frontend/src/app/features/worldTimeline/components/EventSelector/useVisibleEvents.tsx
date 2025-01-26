import { useMemo } from 'react'
import { useSelector } from 'react-redux'

import { getWorldState } from '@/app/features/world/selectors'
import { applyEventDelta } from '@/app/utils/applyEventDelta'
import { isNull } from '@/app/utils/isNull'

import { WorldEvent } from '../../types'

type Props = {
	timestamp: number
	excludedEvents?: WorldEvent[]
	includeInactive?: boolean
}

export const useVisibleEvents = ({ timestamp, excludedEvents, includeInactive }: Props) => {
	const { events, search } = useSelector(
		getWorldState,
		(a, b) => a.events === b.events && a.search === b.search,
	)

	const visibleEvents = useMemo(() => {
		if (search.query) {
			return search.results.events
		}

		return events
			.filter(
				(event) =>
					event.timestamp <= timestamp &&
					!(excludedEvents ?? []).some((excludedEvent) => excludedEvent.id === event.id),
			)
			.map((event, index) => ({
				...event,
				index,
				active: isNull(event.revokedAt) || event.revokedAt > timestamp,
			}))
			.filter((event) => includeInactive || event.active)
			.sort((a, b) => a.timestamp - b.timestamp || a.index - b.index)
			.map((event) => applyEventDelta({ event, timestamp }))
	}, [search, events, timestamp, excludedEvents, includeInactive])

	return visibleEvents
}
