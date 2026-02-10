import { store } from '@/app/store'

type Props = {
	entityId: string
}

export function resolveEntityName({ entityId }: Props) {
	const state = store.getState()
	const events = state.world.events

	const event = events.find((event) => event.id === entityId)
	if (event) {
		return event.name
	}

	const actors = state.world.actors
	const actor = actors.find((actor) => actor.id === entityId)
	if (actor) {
		return actor.name
	}

	const articles = state.wiki.articles
	const article = articles.find((article) => article.id === entityId)
	if (article) {
		return article.name
	}

	const tags = state.world.tags
	const tag = tags.find((tag) => tag.id === entityId)
	if (tag) {
		return tag.name
	}

	return 'Unknown entity'
}
