import { RheaService } from '@src/services/RheaService.js'

import { ResolvedMention, resolveEntityName } from './resolveEntityName.js'

export function resolveSavedMentions({
	entity,
	worldData,
	articleData,
}: {
	entity: {
		mentions: {
			targetId: string
		}[]
		mentionedIn: {
			sourceId: string
		}[]
	}
	worldData: Awaited<ReturnType<typeof RheaService.getWorldDetails>>
	articleData: Awaited<ReturnType<typeof RheaService.getWorldArticles>>
}) {
	const mentions = entity.mentions
		.map((mention) => {
			return resolveEntityName({ entityId: mention.targetId, worldData, articleData })
		})
		.filter((mention): mention is ResolvedMention => mention !== null)

	const reverseMentions = entity.mentionedIn
		.map((mention) => {
			return resolveEntityName({ entityId: mention.sourceId, worldData, articleData })
		})
		.filter((mention): mention is ResolvedMention => mention !== null)

	return [
		{
			type: 'text' as const,
			text:
				'Mentions: ' +
				mentions.map((m) => `${m.name} (${m.type})`).join(`, `) +
				(mentions.length === 0 ? '(None)' : ''),
		},
		{
			type: 'text' as const,
			text:
				'Mentioned in: ' +
				reverseMentions.map((m) => `${m.name} (${m.type})`).join(`, `) +
				(reverseMentions.length === 0 ? '(None)' : ''),
		},
	]
}
