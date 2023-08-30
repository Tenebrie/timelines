import { useMemo } from 'react'
import { useSelector } from 'react-redux'

import { applyEventDelta } from '../../../../../utils/applyEventDelta'
import { asMarkerType } from '../../../../../utils/asMarkerType'
import { useTimelineWorldTime } from '../../../../time/hooks/useTimelineWorldTime'
import { useWorldRouter, worldRoutes } from '../../../router'
import { getEventCreatorState, getEventDeltaCreatorState, getWorldState } from '../../../selectors'
import { WorldEvent, WorldEventBundle, WorldEventGroup } from '../../../types'
import { ScaleLevel } from '../types'

const GROUP_DISTANCE = 35
const EVENTS_PER_GROUP = 5

const useEventGroups = ({ timelineScale, scaleLevel }: { timelineScale: number; scaleLevel: ScaleLevel }) => {
	const { events } = useSelector(getWorldState)
	const { ghost: eventGhost } = useSelector(getEventCreatorState)
	const { ghost: deltaGhost } = useSelector(getEventDeltaCreatorState)
	const { scaledTimeToRealTime } = useTimelineWorldTime({ scaleLevel })

	const { isLocationEqual } = useWorldRouter()

	const eventGroups = useMemo(() => {
		const eventGroups: WorldEventGroup[] = []
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
					}))
				)
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
					}))
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

		sortedEvents.forEach((event) => {
			const closestExistingGroup = eventGroups
				.map((group) => ({
					...group,
					distance: Math.abs(group.timestamp - event.markerPosition),
					originalGroup: group,
				}))
				.sort((a, b) => a.distance - b.distance)[0]

			if (
				!closestExistingGroup ||
				closestExistingGroup.distance >= scaledTimeToRealTime(GROUP_DISTANCE) * timelineScale
			) {
				const newEventGroup = {
					events: [event],
					timestamp: event.markerPosition,
				}
				eventGroups.push(newEventGroup)
			} else {
				closestExistingGroup.events.push(event)
			}
		})

		eventGroups.forEach((group) => {
			group.events.sort((a, b) => a.timestamp - b.timestamp || a.name.localeCompare(b.name))
			if (group.events.length > EVENTS_PER_GROUP) {
				const eventBundle: WorldEventBundle = {
					id: `bundle-${group.timestamp}-${group.events.length}`,
					key: `bundle-${group.timestamp}-${group.events.length}`,
					markerType: 'bundle',
					events: group.events.slice(EVENTS_PER_GROUP) as WorldEvent[],
					timestamp: group.timestamp,
					name: `${group.events.length - (EVENTS_PER_GROUP - 1)} more events`,
					icon: 'bundle',
				}
				group.events = group.events.slice(0, EVENTS_PER_GROUP - 1).concat(eventBundle)
			}
		})
		return eventGroups
	}, [events, eventGhost, isLocationEqual, deltaGhost, scaledTimeToRealTime, timelineScale])

	return eventGroups
}

export default useEventGroups
