import { WorldEvent } from '@/app/features/worldTimeline/types'

export const HoveredTimelineEvents = {
	events: [] as WorldEvent[],
	edgeScrollers: [] as ('left' | 'right')[],

	anyHovered: () => {
		return HoveredTimelineEvents.events.length > 0 || HoveredTimelineEvents.edgeScrollers.length > 0
	},

	hoverEvent: (event: WorldEvent) => {
		HoveredTimelineEvents.events.push(event)
	},

	unhoverEvent: (event: WorldEvent) => {
		HoveredTimelineEvents.events = HoveredTimelineEvents.events.filter(
			(hoveredEvent) => hoveredEvent.id !== event.id,
		)
	},

	hoverEdgeScroller: (side: 'left' | 'right') => {
		HoveredTimelineEvents.edgeScrollers.push(side)
	},

	unhoverEdgeScroller: (side: 'left' | 'right') => {
		HoveredTimelineEvents.edgeScrollers = HoveredTimelineEvents.edgeScrollers.filter(
			(hoveredEvent) => hoveredEvent !== side,
		)
	},
}
