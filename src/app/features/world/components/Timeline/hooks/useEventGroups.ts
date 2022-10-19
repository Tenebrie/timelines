import { useSelector } from 'react-redux'

import { getWorldState } from '../../../selectors'
import { StoryEvent, StoryEventBundle, StoryEventGroup } from '../../../types'

const GROUP_DISTANCE = 75
const EVENTS_PER_GROUP = 5

const useEventGroups = () => {
	const { events } = useSelector(getWorldState)
	const eventGroups: StoryEventGroup[] = []

	const sortedEvents = [...events].sort((a, b) => a.timestamp - b.timestamp)

	sortedEvents.forEach((event) => {
		const closestExistingGroup = eventGroups
			.map((group) => ({
				...group,
				distance: Math.abs(group.timestamp - event.timestamp),
				originalGroup: group,
			}))
			.sort((a, b) => a.distance - b.distance)[0]

		if (!closestExistingGroup || closestExistingGroup.distance >= GROUP_DISTANCE) {
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
			const eventBundle: StoryEventBundle = {
				id: `bundle-${group.timestamp}-${group.events.length}`,
				type: 'bundle',
				events: group.events.slice(EVENTS_PER_GROUP) as StoryEvent[],
				timestamp: group.timestamp,
				name: `${group.events.length - (EVENTS_PER_GROUP - 1)} more events`,
			}
			group.events = group.events.slice(0, EVENTS_PER_GROUP - 1).concat(eventBundle)
		}
	})

	return eventGroups
}

export default useEventGroups
