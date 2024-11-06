import { useMemo } from 'react'
import { useSelector } from 'react-redux'

import { useWorldRouter, worldRoutes } from '../../../../../../../../router/routes/worldRoutes'
import { applyEventDelta } from '../../../../../../../utils/applyEventDelta'
import { asMarkerType } from '../../../../../../../utils/asMarkerType'
import { findStartingFrom } from '../../../../../../../utils/findStartingFrom'
import { getEventCreatorState, getEventDeltaCreatorState, getWorldState } from '../../../../../selectors'
import {
	MarkerType,
	TimelineEntity,
	WorldEvent,
	WorldEventDelta,
	WorldEventTrack,
} from '../../../../../types'
import { useEventTracksRequest } from '../../../hooks/useEventTracksRequest'

export type TimelineTrack = ReturnType<typeof useEventTracks>[number]

const useEventTracks = () => {
	const { events } = useSelector(getWorldState)
	const { ghost: eventGhost } = useSelector(getEventCreatorState)
	const { ghost: deltaGhost } = useSelector(getEventDeltaCreatorState)

	const { isLocationEqual } = useWorldRouter()

	const eventGroups = useMemo<TimelineEntity<MarkerType>[]>(() => {
		const sortedEvents = events
			.map((event) => ({
				...event,
				eventId: event.id,
				key: `${event.id}-issued`,
				markerPosition: event.timestamp,
				markerType: asMarkerType('issuedAt'),
				deltaStates: [...event.deltaStates].sort((a, b) => a.timestamp - b.timestamp),
				baseEntity: event as WorldEvent | WorldEventDelta | null,
				nextEntity: null,
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
						nextEntity: null,
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
						nextEntity: null,
					})),
			)
			.sort((a, b) => a.markerPosition - b.markerPosition)

		const findNextEntity = (event: (typeof sortedEvents)[number], index: number) => {
			if (event.markerType === 'issuedAt' && event.deltaStates.length > 0) {
				return sortedEvents.find((e) => e.id === event.deltaStates[0].id) ?? null
			}
			if (event.markerType === 'issuedAt' && event.revokedAt !== null && event.revokedAt !== undefined) {
				return sortedEvents.find((e) => e.eventId === event.eventId && e.markerType === 'revokedAt') ?? null
			}
			if (event.markerType === 'deltaState') {
				const nextDelta =
					findStartingFrom(
						sortedEvents,
						index + 1,
						(e) => e.eventId === event.eventId && e.markerType === 'deltaState',
					) ?? null
				if (nextDelta) {
					return nextDelta
				}
				if (event.revokedAt !== null && event.revokedAt !== undefined) {
					return sortedEvents.find((e) => e.eventId === event.eventId && e.markerType === 'revokedAt') ?? null
				}
			}
			return null
		}

		const chainedEvents = sortedEvents.map((event, index) => ({
			...event,
			nextEntity: findNextEntity(event, index),
		}))

		if (eventGhost && isLocationEqual(worldRoutes.eventCreator)) {
			chainedEvents.push({
				...eventGhost,
				eventId: eventGhost.id,
				key: eventGhost.id,
				markerType: asMarkerType('ghostEvent'),
				markerPosition: eventGhost.timestamp,
				baseEntity: null,
				nextEntity: null,
			})
		} else if (deltaGhost && isLocationEqual(worldRoutes.eventDeltaCreator)) {
			const event = events.find((event) => event.id === deltaGhost.worldEventId)
			if (event) {
				chainedEvents.push({
					...event,
					eventId: deltaGhost.worldEventId,
					key: deltaGhost.id,
					markerType: asMarkerType('ghostDelta'),
					markerPosition: deltaGhost.timestamp,
					baseEntity: null,
					nextEntity: null,
				})
			}
		}

		return chainedEvents
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
				events: events,
			}
		})

	return tracksWithEvents
}

export default useEventTracks
