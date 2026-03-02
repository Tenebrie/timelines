import { useCallback } from 'react'
import { useSelector } from 'react-redux'

import { useUpdateEventDebounced } from '@/app/views/world/api/useUpdateEventDebounced'
import { getWorldState } from '@/app/views/world/WorldSliceSelectors'

export function useMarkerTimeTravel() {
	const { selectedTimelineMarkers, events } = useSelector(
		getWorldState,
		(a, b) => a.selectedTimelineMarkers === b.selectedTimelineMarkers && a.events === b.events,
	)
	const [updateEvent] = useUpdateEventDebounced()

	const nudge = useCallback(
		(timeDifference: number) => {
			const startingMarker = selectedTimelineMarkers[0]
			if (!startingMarker) {
				return {}
			}

			const event = events.find((e) => e.id === startingMarker.eventId)
			if (!event) {
				return {}
			}

			const allMarkers = [`issuedAt-${event.id}`]
			if (event.revokedAt) {
				allMarkers.push(`revokedAt-${event.id}`)
			}

			const [marker, pushingBoth] = (() => {
				if (!event.revokedAt) {
					return [startingMarker, false] as const
				}
				if (allMarkers.every((m) => selectedTimelineMarkers.map((marker) => marker.key).includes(m))) {
					if (timeDifference > 0) {
						return [
							{
								key: allMarkers[1],
								eventId: startingMarker.eventId,
							},
							true,
						] as const
					} else {
						return [
							{
								key: allMarkers[0],
								eventId: startingMarker.eventId,
							},
							true,
						] as const
					}
				}
				return [startingMarker, false] as const
			})()

			if (pushingBoth) {
				updateEvent(event.id, {
					timestamp: event.timestamp + timeDifference,
					revokedAt: event.revokedAt ? event.revokedAt + timeDifference : undefined,
				})
			} else if (
				marker.key.startsWith('issuedAt-') &&
				event.timestamp + timeDifference >= (event.revokedAt ?? Infinity)
			) {
				return {
					error: `Event "${event.name}" would have negative duration after the move`,
				}
			} else if (marker.key.startsWith('issuedAt-')) {
				updateEvent(event.id, { timestamp: event.timestamp + timeDifference, revokedAt: event.revokedAt })
			} else if (
				marker.key.startsWith('revokedAt-') &&
				event.revokedAt &&
				event.revokedAt + timeDifference <= event.timestamp
			) {
				return {
					error: `Event "${event.name}" would have negative duration after the move`,
				}
			} else if (marker.key.startsWith('revokedAt-')) {
				updateEvent(event.id, {
					revokedAt: event.revokedAt ? event.revokedAt + timeDifference : undefined,
					timestamp: event.timestamp,
				})
			}
			return {}
		},
		[events, selectedTimelineMarkers, updateEvent],
	)

	return [nudge] as const
}
