import { ContextService } from '@src/services/ContextService.js'
import { RheaService } from '@src/services/RheaService.js'

export function nameMatchesFuzzy({ query, entityName }: { query: string; entityName: string }): boolean {
	return entityName.trim().toLowerCase().includes(query.trim().toLowerCase())
}

export function nameMatchesExactly({ query, entityName }: { query: string; entityName: string }): boolean {
	return entityName.trim().toLowerCase() === query.trim().toLowerCase()
}

export function findByName<T extends { name: string }>({ name, entities }: { name: string; entities: T[] }) {
	const exactMatches = entities.filter((actor) => nameMatchesExactly({ query: name, entityName: actor.name }))
	if (exactMatches.length > 1) {
		throw new Error(`Multiple entities found exactly matching "${name}".`)
	}

	const matchingEntities = entities.filter((actor) =>
		nameMatchesFuzzy({ query: name, entityName: actor.name }),
	)

	if (matchingEntities.length === 0) {
		throw new Error(
			`No entities found matching "${name}". Available: ${entities.map((e) => e.name).join(', ')}`,
		)
	}

	if (matchingEntities.length > 1 && exactMatches.length === 1) {
		return exactMatches[0]
	}

	if (matchingEntities.length > 1 && exactMatches.length === 0) {
		throw new Error(
			`Multiple entities found fuzzy matching "${name}": ${matchingEntities.map((e) => e.name).join(', ')}`,
		)
	}

	return matchingEntities[0]
}

export async function checkActorDoesNotExist({
	name,
	userId,
	sessionId,
}: {
	name: string
	userId: string
	sessionId: string
}) {
	const worldId = ContextService.getCurrentWorldOrThrow(sessionId)
	const worldData = await RheaService.getWorldDetails({ userId, worldId })
	const matchingActor = worldData.actors.find((actor) =>
		nameMatchesExactly({ query: name, entityName: actor.name }),
	)
	if (matchingActor) {
		throw new Error(`Entity "${name}" already exists.`)
	}
}

export async function checkArticleDoesNotExist({
	name,
	userId,
	sessionId,
}: {
	name: string
	userId: string
	sessionId: string
}) {
	const worldId = ContextService.getCurrentWorldOrThrow(sessionId)
	const articles = await RheaService.getWorldArticles({ userId, worldId })
	const matchingArticle = articles.find((article) =>
		nameMatchesExactly({ query: name, entityName: article.name }),
	)
	if (matchingArticle) {
		throw new Error(`Article "${name}" already exists.`)
	}
}

export async function checkEventDoesNotExist({
	name,
	userId,
	sessionId,
}: {
	name: string
	userId: string
	sessionId: string
}) {
	const worldId = ContextService.getCurrentWorldOrThrow(sessionId)
	const worldData = await RheaService.getWorldDetails({ userId, worldId })
	const matchingEvent = worldData.events.find((event) =>
		nameMatchesExactly({ query: name, entityName: event.name }),
	)
	if (matchingEvent) {
		throw new Error(`Event "${name}" already exists.`)
	}
}
