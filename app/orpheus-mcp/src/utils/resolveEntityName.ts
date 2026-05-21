import { RheaService } from '@src/services/RheaService.js'

import { toAgentReadableText } from './toAgentReadableText.js'

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

	function toSummary(content: string) {
		const firstParagraph = content.match(/<p[^>]*>(.*?)<\/p>/s)?.[1] ?? content.trim()
		return toAgentReadableText({ content: firstParagraph }).replace(/<[^>]*>/g, '')
	}

	const event = events.find((event) => event.id === entityId)
	if (event)
		return {
			type: 'event',
			name: event.name,
			fullName: event.name,
			summary: toSummary(event.descriptionRich),
		}

	const actor = actors.find((actor) => actor.id === entityId)
	if (actor)
		return {
			type: 'actor',
			name: actor.name,
			fullName: `${actor.name}${actor.title ? `, ${actor.title}` : ''}`,
			summary: toSummary(actor.descriptionRich),
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
