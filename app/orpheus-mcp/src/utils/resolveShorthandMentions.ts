import { RheaService } from '@src/services/RheaService.js'

import { nameMatchesExactly, nameMatchesFuzzy } from './findByName.js'

type MentionType = 'actor' | 'event' | 'tag' | 'article'

type EntityWithId = { id: string; name: string }

function findEntityByNameSoft<T extends EntityWithId>({
	name,
	entities,
}: {
	name: string
	entities: T[]
}): T | null {
	const exactMatches = entities.filter((entity) =>
		nameMatchesExactly({ query: name, entityName: entity.name }),
	)
	if (exactMatches.length === 1) {
		return exactMatches[0]
	}
	if (exactMatches.length > 1) {
		throw new Error(
			`Ambiguous mention "@[${name}]": multiple entities found with exact name match: ${exactMatches.map((e) => `"${e.name}"`).join(', ')}`,
		)
	}

	const fuzzyMatches = entities.filter((entity) => nameMatchesFuzzy({ query: name, entityName: entity.name }))
	if (fuzzyMatches.length === 1) {
		return fuzzyMatches[0]
	}
	if (fuzzyMatches.length > 1) {
		throw new Error(
			`Ambiguous mention "@[${name}]": multiple entities found with fuzzy match: ${fuzzyMatches.map((e) => `"${e.name}"`).join(', ')}`,
		)
	}

	return null
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

		// Try to find the entity in each collection
		const actor = findEntityByNameSoft({ name: entityName, entities: worldData.actors })
		const event = findEntityByNameSoft({ name: entityName, entities: worldData.events })
		const tag = findEntityByNameSoft({ name: entityName, entities: worldData.tags })
		const article = findEntityByNameSoft({ name: entityName, entities: articleData })

		// Collect all matches across entity types
		const foundEntities: { type: MentionType; entity: EntityWithId }[] = []
		if (actor) foundEntities.push({ type: 'actor', entity: actor })
		if (event) foundEntities.push({ type: 'event', entity: event })
		if (tag) foundEntities.push({ type: 'tag', entity: tag })
		if (article) foundEntities.push({ type: 'article', entity: article })

		if (foundEntities.length === 0) {
			throw new Error(
				`Unable to resolve mention "@[${entityName}]": no matching entity found in actors, events, tags, or articles.`,
			)
		}

		if (foundEntities.length > 1) {
			throw new Error(
				`Ambiguous mention "@[${entityName}]": matches multiple entity types: ${foundEntities.map((e) => `${e.type} "${e.entity.name}"`).join(', ')}. Please use a more specific name.`,
			)
		}

		const { type, entity } = foundEntities[0]
		const htmlMention = createMentionHtml({ type, id: entity.id, name: entity.name })
		result = result.replace(fullMatch, htmlMention)
	}

	return result
}
