import { MarkerType, TimelineEntity, WorldEvent } from '@api/types/worldTypes'
import { useState } from 'react'

import { dispatchGlobalEvent, useEventBusSubscribe } from '@/app/features/eventBus'

export const HoveredTimelineEvents = {
	events: [] as WorldEvent[],
	edgeScrollers: [] as ('left' | 'right')[],

	anyHovered: () => {
		return HoveredTimelineEvents.events.length > 0 || HoveredTimelineEvents.edgeScrollers.length > 0
	},

	hoverEvent: (marker: TimelineEntity<MarkerType>) => {
		HoveredTimelineEvents.events.push(marker)
		dispatchGlobalEvent['timeline/onMarkerHovered']({ hover: true, marker })
	},

	unhoverEvent: (marker: TimelineEntity<MarkerType>) => {
		HoveredTimelineEvents.events = HoveredTimelineEvents.events.filter(
			(hoveredEvent) => hoveredEvent.id !== marker.id,
		)
		dispatchGlobalEvent['timeline/onMarkerHovered']({ hover: false, marker })
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

export const useHoveredTimelineMarker = (target: TimelineEntity<MarkerType>) => {
	const [hovered, setHovered] = useState(false)
	const [lastHovered, setLastHovered] = useState(false)

	useEventBusSubscribe['timeline/onMarkerHovered']({
		callback: ({ marker, hover }) => {
			if (target.key === marker.key) {
				setHovered(hover)
				if (hover) {
					setLastHovered(true)
				}
			}
			if (target.key !== marker.key && lastHovered && hover) {
				setLastHovered(false)
			}
		},
	})

	return { hovered, lastHovered }
}
