import { RheaService } from '@src/services/RheaService.js'

export type ResolvedMention = {
	name: string
	type: 'event' | 'actor' | 'tag' | 'article'
}

export function resolveEntityName({
	entityId,
	worldData,
	articleData,
}: {
	entityId: string
	worldData: Awaited<ReturnType<typeof RheaService.getWorldDetails>>
	articleData: Awaited<ReturnType<typeof RheaService.getWorldArticles>>
}): ResolvedMention | null {
	const { events, actors, tags } = worldData
	const articles = articleData

	const event = events.find((event) => event.id === entityId)
	if (event)
		return {
			type: 'event',
			name: event.name,
		}

	const actor = actors.find((actor) => actor.id === entityId)
	if (actor)
		return {
			type: 'actor',
			name: actor.name,
		}

	const tag = tags.find((tag) => tag.id === entityId)
	if (tag)
		return {
			type: 'tag',
			name: tag.name,
		}

	const article = articles.find((article) => article.id === entityId)
	if (article)
		return {
			type: 'article',
			name: article.name,
		}

	return null
}
