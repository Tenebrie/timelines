import { store } from '@/app/store'

type Props = {
	entityId: string
}

let cachedState: unknown = null
let entityMap: Map<string, string> | null = null

function getEntityMap() {
	const state = store.getState()
	if (state === cachedState && entityMap) {
		return entityMap
	}

	cachedState = state
	entityMap = new Map<string, string>()

	for (const event of state.world.events) {
		entityMap.set(event.id, event.name)
	}
	for (const actor of state.world.actors) {
		entityMap.set(actor.id, actor.name)
	}
	for (const article of state.wiki.articles) {
		entityMap.set(article.id, article.name)
	}
	for (const tag of state.world.tags) {
		entityMap.set(tag.id, tag.name)
	}

	return entityMap
}

export function resolveEntityName({ entityId }: Props) {
	return getEntityMap().get(entityId) ?? 'Unknown entity'
}
