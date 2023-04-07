import { WorldEvent, WorldEventBundle } from '../../../../../../types'

export const HoveredTimelineEvents = {
	events: [] as (WorldEvent | WorldEventBundle)[],
	edgeScrollers: [] as ('left' | 'right')[],

	anyHovered: () => {
		return HoveredTimelineEvents.events.length > 0 || HoveredTimelineEvents.edgeScrollers.length > 0
	},

	hoverEvent: (event: WorldEvent | WorldEventBundle) => {
		HoveredTimelineEvents.events.push(event)
	},

	unhoverEvent: (event: WorldEvent | WorldEventBundle) => {
		HoveredTimelineEvents.events = HoveredTimelineEvents.events.filter(
			(hoveredEvent) => hoveredEvent.id !== event.id
		)
	},

	hoverEdgeScroller: (side: 'left' | 'right') => {
		HoveredTimelineEvents.edgeScrollers.push(side)
	},

	unhoverEdgeScroller: (side: 'left' | 'right') => {
		HoveredTimelineEvents.edgeScrollers = HoveredTimelineEvents.edgeScrollers.filter(
			(hoveredEvent) => hoveredEvent !== side
		)
	},
}
