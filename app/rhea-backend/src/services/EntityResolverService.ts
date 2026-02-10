import { ActorService } from './ActorService.js'
import { TagService } from './TagService.js'
import { WikiService } from './WikiService.js'
import { WorldEventService } from './WorldEventService.js'

export const EntityResolverService = {
	resolveEntityName: async ({
		worldId,
		entityType,
		entityId,
	}: {
		worldId: string
		entityType: 'actor' | 'event' | 'article' | 'tag'
		entityId: string
	}) => {
		if (entityType === 'actor') {
			const actor = await ActorService.findActor({ worldId, actorId: entityId })
			return actor?.name ?? ''
		} else if (entityType === 'event') {
			const event = await WorldEventService.findEventById({ id: entityId, worldId })
			return event?.name ?? ''
		} else if (entityType === 'article') {
			const article = await WikiService.findArticleById({ id: entityId, worldId })
			return article?.name ?? ''
		} else if (entityType === 'tag') {
			const tag = await TagService.findTag({ worldId, tagId: entityId })
			return tag?.name ?? ''
		}
		return ''
	},
}
