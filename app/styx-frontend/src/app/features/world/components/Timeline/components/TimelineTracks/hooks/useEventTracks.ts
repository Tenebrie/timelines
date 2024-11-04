import { useMemo } from 'react'
import { useSelector } from 'react-redux'

import { useWorldRouter, worldRoutes } from '../../../../../../../../router/routes/worldRoutes'
import { applyEventDelta } from '../../../../../../../utils/applyEventDelta'
import { asMarkerType } from '../../../../../../../utils/asMarkerType'
import { getEventCreatorState, getEventDeltaCreatorState, getWorldState } from '../../../../../selectors'
import { WorldEvent, WorldEventDelta, WorldEventTrack } from '../../../../../types'
import { useEventTracksRequest } from '../../../hooks/useEventTracksRequest'

export type TimelineTrack = ReturnType<typeof useEventTracks>[number]

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
				baseEntity: event as WorldEvent | WorldEventDelta | null,
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
						baseEntity: delta,
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
						baseEntity: event,
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
				baseEntity: null,
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
					baseEntity: null,
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
			baseModel: track as WorldEventTrack | null,
		}))
		.concat([
			{
				id: 'default',
				name: 'Unassigned',
				position: Infinity,
				baseModel: null,
			},
		])
		.sort((a, b) => b.position - a.position)
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
