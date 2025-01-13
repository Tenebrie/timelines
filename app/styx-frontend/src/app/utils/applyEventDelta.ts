import { WorldEvent } from '../features/worldTimeline/types'

export const applyEventDelta = ({ event, timestamp }: { event: WorldEvent; timestamp: number }) =>
	event.deltaStates.reduce((total, delta) => {
		if (delta.timestamp > timestamp) {
			return total
		}
		return {
			...total,
			name: delta.name ?? total.name,
			description: delta.description ?? total.description,
		}
	}, event)
