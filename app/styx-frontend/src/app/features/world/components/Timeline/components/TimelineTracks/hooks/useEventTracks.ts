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
				key: `issuedAt-${event.id}`,
				markerPosition: event.timestamp,
				markerType: asMarkerType('issuedAt'),
				markerHeight: 0,
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
						key: `deltaState-${delta.id}`,
						markerPosition: delta.timestamp,
						markerType: asMarkerType('deltaState'),
						markerHeight: 0,
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
						key: `revokedAt-${event.id}`,
						markerPosition: event.revokedAt!,
						markerType: asMarkerType('revokedAt'),
						markerHeight: 0,
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
				key: `ghostEvent-${eventGhost.id}`,
				markerType: asMarkerType('ghostEvent'),
				markerPosition: eventGhost.timestamp,
				markerHeight: 0,
				baseEntity: null,
				nextEntity: null,
			})
		} else if (deltaGhost && isLocationEqual(worldRoutes.eventDeltaCreator)) {
			const event = events.find((event) => event.id === deltaGhost.worldEventId)
			if (event) {
				chainedEvents.push({
					...event,
					eventId: deltaGhost.worldEventId,
					key: `ghostDelta-${deltaGhost.id}`,
					markerType: asMarkerType('ghostDelta'),
					markerPosition: deltaGhost.timestamp,
					markerHeight: 0,
					baseEntity: null,
					nextEntity: null,
				})
			}
		}

		return chainedEvents
	}, [events, eventGhost, isLocationEqual, deltaGhost])

	const { tracks } = useEventTracksRequest()
	const tracksWithEvents = useMemo(
		() =>
			tracks
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
				.sort((a, b) => a.position - b.position)
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
				}),
		[eventGroups, tracks],
	)
	const finalizedTracks = calculateMarkerHeights(tracksWithEvents) as typeof tracksWithEvents
	return finalizedTracks
}

const calculateMarkerHeights = (tracks: TimelineTrack[]) => {
	const data: Record<string, TimelineEntity<MarkerType>[]> = {}
	const currentState: TimelineEntity<MarkerType>[] = []

	return tracks.map((track) => {
		return {
			...track,
			events: track.events.map((event) => {
				if (event.markerType === 'ghostEvent' || event.markerType === 'ghostDelta') {
					return event
				}
				if (event.markerType !== 'issuedAt') {
					return {
						...event,
						markerHeight: currentState.find((m) => m.eventId === event.eventId)!.markerHeight,
					}
				}

				const trackId = event.worldEventTrackId ?? 'default'
				const previousEvents =
					data[trackId]?.filter(
						(e) => e.timestamp < event.markerPosition && e.revokedAt! > event.markerPosition,
					) ?? []
				const height = previousEvents.length
				if (event.deltaStates.length > 0 || (event.revokedAt !== null && event.revokedAt !== undefined)) {
					data[trackId] = previousEvents.concat(event)
				}
				const newEvent = {
					...event,
					markerHeight: height,
				}
				currentState.push(newEvent)
				return newEvent
			}),
		}
	})
}

export default useEventTracks
