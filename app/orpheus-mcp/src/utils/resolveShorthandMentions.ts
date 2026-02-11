import { RheaService } from '@src/services/RheaService.js'

import { nameMatchesExactly, nameMatchesFuzzy } from './findByName.js'

type MentionType = 'actor' | 'event' | 'tag' | 'article'

type EntityWithId = { id: string; name: string }

type MatchResult<T> = {
	exact: T[]
	fuzzy: T[]
}

function findEntitiesByName<T extends EntityWithId>({
	name,
	entities,
}: {
	name: string
	entities: T[]
}): MatchResult<T> {
	const exactMatches = entities.filter((entity) =>
		nameMatchesExactly({ query: name, entityName: entity.name }),
	)
	const fuzzyMatches = entities.filter((entity) => nameMatchesFuzzy({ query: name, entityName: entity.name }))

	return {
		exact: exactMatches,
		fuzzy: fuzzyMatches,
	}
}

function createMentionHtml({ type, id, name }: { type: MentionType; id: string; name: string }): string {
	const componentProps = JSON.stringify({ [type]: id })
	const escapedProps = componentProps
		.replace(/&/g, '&amp;')
		.replace(/"/g, '&quot;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
	return `<span data-component-props="${escapedProps}" data-type="mention" data-name="${name}"></span>`
}

export async function resolveShorthandMentions({
	content,
	worldData,
	articleData,
}: {
	content: string
	worldData: Awaited<ReturnType<typeof RheaService.getWorldDetails>>
	articleData: Awaited<ReturnType<typeof RheaService.getWorldArticles>>
}): Promise<string> {
	// Match @[...] pattern that is NOT inside an existing HTML tag
	// We need to avoid matching things like data-name="@[Something]"
	const shorthandPattern = /@\[([^\]]+)\]/g

	let result = content
	let match: RegExpExecArray | null

	// Collect all matches first to avoid issues with modifying string while iterating
	const matches: { fullMatch: string; entityName: string; index: number }[] = []
	while ((match = shorthandPattern.exec(content)) !== null) {
		// Check if this match is inside an HTML tag attribute (between < and >)
		const beforeMatch = content.substring(0, match.index)
		const lastOpenTag = beforeMatch.lastIndexOf('<')
		const lastCloseTag = beforeMatch.lastIndexOf('>')

		// If we're inside a tag (last < is after last >), skip this match
		if (lastOpenTag > lastCloseTag) {
			continue
		}

		matches.push({
			fullMatch: match[0],
			entityName: match[1],
			index: match.index,
		})
	}

	// Process matches in reverse order to preserve indices
	for (let i = matches.length - 1; i >= 0; i--) {
		const { fullMatch, entityName } = matches[i]

		// Find matches in each entity type
		const actorMatches = findEntitiesByName({ name: entityName, entities: worldData.actors })
		const eventMatches = findEntitiesByName({ name: entityName, entities: worldData.events })
		const tagMatches = findEntitiesByName({ name: entityName, entities: worldData.tags })
		const articleMatches = findEntitiesByName({ name: entityName, entities: articleData })

		// Collect all exact matches across entity types
		const exactMatches: { type: MentionType; entity: EntityWithId }[] = []
		for (const entity of actorMatches.exact) exactMatches.push({ type: 'actor', entity })
		for (const entity of eventMatches.exact) exactMatches.push({ type: 'event', entity })
		for (const entity of tagMatches.exact) exactMatches.push({ type: 'tag', entity })
		for (const entity of articleMatches.exact) exactMatches.push({ type: 'article', entity })

		// If we have exact matches, use them (priority over fuzzy)
		if (exactMatches.length === 1) {
			const { type, entity } = exactMatches[0]
			const htmlMention = createMentionHtml({ type, id: entity.id, name: entity.name })
			result = result.replace(fullMatch, htmlMention)
			continue
		}

		if (exactMatches.length > 1) {
			throw new Error(
				`Ambiguous mention "@[${entityName}]": multiple entities found with exact name match: ${exactMatches.map((e) => `${e.type} "${e.entity.name}"`).join(', ')}. Please use a more specific name.`,
			)
		}

		// No exact matches, try fuzzy matches
		const fuzzyMatches: { type: MentionType; entity: EntityWithId }[] = []
		for (const entity of actorMatches.fuzzy) fuzzyMatches.push({ type: 'actor', entity })
		for (const entity of eventMatches.fuzzy) fuzzyMatches.push({ type: 'event', entity })
		for (const entity of tagMatches.fuzzy) fuzzyMatches.push({ type: 'tag', entity })
		for (const entity of articleMatches.fuzzy) fuzzyMatches.push({ type: 'article', entity })

		if (fuzzyMatches.length === 1) {
			const { type, entity } = fuzzyMatches[0]
			const htmlMention = createMentionHtml({ type, id: entity.id, name: entity.name })
			result = result.replace(fullMatch, htmlMention)
			continue
		}

		if (fuzzyMatches.length > 1) {
			throw new Error(
				`Ambiguous mention "@[${entityName}]": multiple entities found with fuzzy match: ${fuzzyMatches.map((e) => `${e.type} "${e.entity.name}"`).join(', ')}. Please use a more specific name.`,
			)
		}

		// No matches found at all
		throw new Error(
			`Unable to resolve mention "@[${entityName}]": no matching entity found in actors, events, tags, or articles.`,
		)
	}

	return result
}
