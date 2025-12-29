import { useGetMindmapQuery } from '@api/otherApi'
import { useSelector } from 'react-redux'

import { getTimelineState, getWorldState } from '@/app/views/world/WorldSliceSelectors'

export function useEntityResolver() {
	const {
		id: worldId,
		events,
		actors,
	} = useSelector(getWorldState, (a, b) => a.id === b.id && a.events === b.events && a.actors === b.actors)
	const { data: mindmapData } = useGetMindmapQuery({ worldId }, { skip: !worldId })
	const { markers } = useSelector(getTimelineState, (a, b) => a.markers === b.markers)

	const resolveEntity = (entityId: string) => {
		const event = events.find((e) => e.id === entityId)
		if (event) {
			return { type: 'event', entity: event } as const
		}

		const marker = markers.find((m) => m.key === entityId)
		if (marker) {
			const event = events.find((e) => e.id === marker.eventId)
			if (event) {
				return { type: 'event', entity: event } as const
			}
		}

		const node = mindmapData?.nodes.find((n) => n.id === entityId)
		if (node) {
			const actor = actors.find((e) => e.id === node.parentActorId)
			if (actor) {
				return { type: 'actor', entity: actor } as const
			}
		}

		const actor = actors.find((a) => a.id === entityId)
		if (actor) {
			return { type: 'actor', entity: actor } as const
		}
		return null
	}

	return { resolveEntity }
}
