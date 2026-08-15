import { RheaService } from '@src/services/RheaService.js'

import { formatTimestamp } from './formatTimestamp.js'
import { toSummary } from './toSummary.js'

export type ResolvedMention = {
	name: string
	type: 'event' | 'actor' | 'tag' | 'article'
	fullName: string
	summary: string
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
			name: `${event.name}`,
			fullName: `${event.name} :: ${formatTimestamp(event.timestamp, worldData)}`,
			summary: toSummary(event.contentRich),
		}

	const actor = actors.find((actor) => actor.id === entityId)
	if (actor)
		return {
			type: 'actor',
			name: actor.name,
			fullName: `${actor.name}${actor.title ? `, ${actor.title}` : ''}`,
			summary: toSummary(actor.contentRich),
		}

	const tag = tags.find((tag) => tag.id === entityId)
	if (tag)
		return {
			type: 'tag',
			name: tag.name,
			fullName: tag.name,
			summary: toSummary(tag.description),
		}

	const article = articles.find((article) => article.id === entityId)
	if (article)
		return {
			type: 'article',
			name: article.name,
			fullName: article.name,
			summary: toSummary(article.contentRich),
		}

	return null
}
