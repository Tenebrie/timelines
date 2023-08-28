import { useCallback, useMemo } from 'react'
import { useSelector } from 'react-redux'

import { useTimelineWorldTime } from '../../../../time/hooks/useTimelineWorldTime'
import { useWorldRouter, worldRoutes } from '../../../router'
import { getEventCreatorState, getWorldState } from '../../../selectors'
import { MarkerType, WorldEvent, WorldEventBundle, WorldEventGroup } from '../../../types'
import { ScaleLevel } from '../types'

const GROUP_DISTANCE = 35
const EVENTS_PER_GROUP = 5

const useEventGroups = ({ timelineScale, scaleLevel }: { timelineScale: number; scaleLevel: ScaleLevel }) => {
	const { events } = useSelector(getWorldState)
	const { ghostEvent } = useSelector(getEventCreatorState)
	const { scaledTimeToRealTime } = useTimelineWorldTime({ scaleLevel })

	const { isLocationEqual } = useWorldRouter()

	const getMarkerType = useCallback(
		(event: WorldEvent): MarkerType =>
			event.replaces ? ('replaceAt' as MarkerType) : ('issuedAt' as MarkerType),
		[]
	)

	const eventGroups = useMemo(() => {
		const eventGroups: WorldEventGroup[] = []
		const sortedEvents = events
			.map((event) => ({ ...event, markerPosition: event.timestamp, markerType: getMarkerType(event) }))
			.concat(
				events
					.filter((event) => !!event.revokedAt)
					.map((event) => ({ ...event, markerPosition: event.revokedAt!, markerType: 'revokedAt' }))
			)
			.sort((a, b) => b.markerPosition - a.markerPosition)

		if (ghostEvent && isLocationEqual(worldRoutes.eventCreator)) {
			sortedEvents.push({
				...ghostEvent,
				markerType: 'ghost',
				markerPosition: ghostEvent.timestamp,
			})
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
	}, [events, ghostEvent, isLocationEqual, scaledTimeToRealTime, timelineScale])

	return eventGroups
}

export default useEventGroups
