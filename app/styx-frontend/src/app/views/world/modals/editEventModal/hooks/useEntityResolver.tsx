import { useGetMindmapQuery } from '@api/otherApi'
import { useSelector } from 'react-redux'

import { getWikiState } from '@/app/views/world/views/wiki/WikiSliceSelectors'
import { getTimelineState, getWorldState } from '@/app/views/world/WorldSliceSelectors'

export function useEntityResolver() {
	const {
		id: worldId,
		events,
		actors,
		tags,
	} = useSelector(
		getWorldState,
		(a, b) => a.id === b.id && a.events === b.events && a.actors === b.actors && a.tags === b.tags,
	)
	const { data: mindmapData } = useGetMindmapQuery({ worldId }, { skip: !worldId })
	const { markers } = useSelector(getTimelineState, (a, b) => a.markers === b.markers)
	const { articles } = useSelector(getWikiState, (a, b) => a.articles === b.articles)

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

		const article = articles.find((a) => a.id === entityId)
		if (article) {
			return { type: 'article', entity: article } as const
		}

		const tag = tags.find((t) => t.id === entityId)
		if (tag) {
			return { type: 'tag', entity: tag } as const
		}

		return null
	}

	return { resolveEntity }
}
