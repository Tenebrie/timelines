import { useMemo } from 'react'
import { useSelector } from 'react-redux'

import { useTimelineWorldTime } from '../../../../time/hooks/useTimelineWorldTime'
import { getWorldState } from '../../../selectors'
import { WorldEvent, WorldEventBundle, WorldEventGroup } from '../../../types'
import { ScaleLevel } from '../types'

const GROUP_DISTANCE = 35
const EVENTS_PER_GROUP = 5

const useEventGroups = ({ timelineScale, scaleLevel }: { timelineScale: number; scaleLevel: ScaleLevel }) => {
	const { events } = useSelector(getWorldState)
	const { scaledTimeToRealTime } = useTimelineWorldTime({ scaleLevel })

	const eventGroups = useMemo(() => {
		const eventGroups: WorldEventGroup[] = []
		const sortedEvents = [...events].sort((a, b) => a.timestamp - b.timestamp)

		sortedEvents.forEach((event) => {
			const closestExistingGroup = eventGroups
				.map((group) => ({
					...group,
					distance: Math.abs(group.timestamp - event.timestamp),
					originalGroup: group,
				}))
				.sort((a, b) => a.distance - b.distance)[0]

			if (
				!closestExistingGroup ||
				closestExistingGroup.distance >= scaledTimeToRealTime(GROUP_DISTANCE) * timelineScale
			) {
				const newEventGroup = {
					events: [event],
					timestamp: event.timestamp,
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
					type: 'BUNDLE',
					events: group.events.slice(EVENTS_PER_GROUP) as WorldEvent[],
					timestamp: group.timestamp,
					name: `${group.events.length - (EVENTS_PER_GROUP - 1)} more events`,
				}
				group.events = group.events.slice(0, EVENTS_PER_GROUP - 1).concat(eventBundle)
			}
		})
		return eventGroups
	}, [events, scaledTimeToRealTime, timelineScale])

	return eventGroups
}

export default useEventGroups
