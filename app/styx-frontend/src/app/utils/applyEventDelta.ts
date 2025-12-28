import { WorldEvent } from '../../api/types/worldTypes'

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
