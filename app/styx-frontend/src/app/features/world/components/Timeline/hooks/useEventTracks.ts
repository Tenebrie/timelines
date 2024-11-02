import { useMemo } from 'react'
import { useSelector } from 'react-redux'

import { useWorldRouter, worldRoutes } from '../../../../../../router/routes/worldRoutes'
import { applyEventDelta } from '../../../../../utils/applyEventDelta'
import { asMarkerType } from '../../../../../utils/asMarkerType'
import { getEventCreatorState, getEventDeltaCreatorState, getWorldState } from '../../../selectors'
import { useEventTracksRequest } from './useEventTracksRequest'

const useEventTracks = () => {
	const { events } = useSelector(getWorldState)
	const { ghost: eventGhost } = useSelector(getEventCreatorState)
	const { ghost: deltaGhost } = useSelector(getEventDeltaCreatorState)

	const { isLocationEqual } = useWorldRouter()

	const eventGroups = useMemo(() => {
		const sortedEvents = events
			.map((event) => ({
				...event,
				eventId: event.id,
				key: `${event.id}-issued`,
				markerPosition: event.timestamp,
				markerType: asMarkerType('issuedAt'),
			}))
			.concat(
				events.flatMap((event) =>
					event.deltaStates.map((delta) => ({
						...applyEventDelta({ event, timestamp: delta.timestamp }),
						id: delta.id,
						eventId: event.id,
						key: `${delta.id}-delta`,
						markerPosition: delta.timestamp,
						markerType: asMarkerType('deltaState'),
					})),
				),
			)
			.concat(
				events
					.filter((event) => !!event.revokedAt)
					.map((event) => ({
						...event,
						eventId: event.id,
						key: `${event.id}-revoked`,
						markerPosition: event.revokedAt!,
						markerType: asMarkerType('revokedAt'),
					})),
			)
			.sort((a, b) => b.markerPosition - a.markerPosition)

		if (eventGhost && isLocationEqual(worldRoutes.eventCreator)) {
			sortedEvents.push({
				...eventGhost,
				eventId: eventGhost.id,
				key: eventGhost.id,
				markerType: asMarkerType('ghostEvent'),
				markerPosition: eventGhost.timestamp,
			})
		} else if (deltaGhost && isLocationEqual(worldRoutes.eventDeltaCreator)) {
			const event = events.find((event) => event.id === deltaGhost.worldEventId)
			if (event) {
				sortedEvents.push({
					...event,
					eventId: deltaGhost.worldEventId,
					key: deltaGhost.id,
					markerType: asMarkerType('ghostDelta'),
					markerPosition: deltaGhost.timestamp,
				})
			}
		}

		return sortedEvents
	}, [events, eventGhost, isLocationEqual, deltaGhost])

	const { tracks } = useEventTracksRequest()
	const tracksWithEvents = tracks
		.map((track) => ({
			id: track.id,
			name: track.name,
			position: track.position,
		}))
		.concat([
			{
				id: 'default',
				name: 'Unassigned',
				position: tracks.length,
			},
		])
		.map((track) => {
			const events = eventGroups.filter(
				(event) =>
					event.worldEventTrackId === track.id ||
					(event.worldEventTrackId === null && track.id === 'default'),
			)

			return {
				...track,
				events,
			}
		})

	return tracksWithEvents
}

export default useEventTracks
