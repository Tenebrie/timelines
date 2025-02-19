import { useState } from 'react'

import { dispatchEvent, useEventBusSubscribe } from '@/app/features/eventBus'
import { MarkerType, TimelineEntity, WorldEvent } from '@/app/features/worldTimeline/types'

export const HoveredTimelineEvents = {
	events: [] as WorldEvent[],
	edgeScrollers: [] as ('left' | 'right')[],

	anyHovered: () => {
		return HoveredTimelineEvents.events.length > 0 || HoveredTimelineEvents.edgeScrollers.length > 0
	},

	hoverEvent: (marker: TimelineEntity<MarkerType>) => {
		HoveredTimelineEvents.events.push(marker)
		dispatchEvent({ event: 'timeline/markerHovered', params: { hover: true, marker } })
	},

	unhoverEvent: (marker: TimelineEntity<MarkerType>) => {
		HoveredTimelineEvents.events = HoveredTimelineEvents.events.filter(
			(hoveredEvent) => hoveredEvent.id !== marker.id,
		)
		dispatchEvent({ event: 'timeline/markerHovered', params: { hover: false, marker } })
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

export const useHoveredTimelineMarker = (marker: TimelineEntity<MarkerType>) => {
	const [hovered, setHovered] = useState(false)

	useEventBusSubscribe({
		event: 'timeline/markerHovered',
		condition: (data) => data.marker.key === marker.key,
		callback: ({ hover }) => {
			setHovered(hover)
		},
	})

	return { hovered }
}
