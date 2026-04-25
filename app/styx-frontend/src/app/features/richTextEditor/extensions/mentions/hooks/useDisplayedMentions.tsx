import { Actor, WorldEvent, WorldTag } from '@api/types/worldTypes'
import { useMemo } from 'react'
import { useSelector } from 'react-redux'

import { WikiArticle } from '@/api/types/worldWikiTypes'
import { useListArticles } from '@/app/views/world/api/useListArticles'
import { getWorldState } from '@/app/views/world/WorldSliceSelectors'

type Props = {
	query: string
}

export type Mention = {
	id: string
	name: string
	updatedAt: number
} & (
	| {
			type: 'Actor'
			actor: Actor
	  }
	| {
			type: 'Event'
			event: WorldEvent
	  }
	| {
			type: 'Article'
			article: WikiArticle
	  }
	| {
			type: 'Tag'
			tag: WorldTag
	  }
)

export const useDisplayedMentions = ({ query }: Props) => {
	const { data: articles } = useListArticles()

	const { actors, events, tags } = useSelector(
		getWorldState,
		(a, b) => a.actors === b.actors && a.events === b.events && a.tags === b.tags,
	)

	const { mentions, actorCount, eventCount, articleCount, tagCount } = useMemo(() => {
		if (!articles) {
			return {
				mentions: [],
				actorCount: 0,
				eventCount: 0,
				articleCount: 0,
				tagCount: 0,
			}
		}

		const allActors: Mention[] = actors.map((actor) => ({
			id: actor.id,
			name: actor.name,
			type: 'Actor' as const,
			actor,
			updatedAt: new Date(actor.updatedAt).getTime(),
		}))

		const allEvents: Mention[] = events.map((event) => ({
			id: event.id,
			name: event.name,
			type: 'Event' as const,
			event,
			updatedAt: new Date(event.updatedAt).getTime(),
		}))

		const allArticles: Mention[] = articles.map((article) => ({
			id: article.id,
			name: article.name,
			type: 'Article' as const,
			article,
			updatedAt: new Date(article.updatedAt).getTime(),
		}))

		const allTags: Mention[] = tags.map((tag) => ({
			id: tag.id,
			name: tag.name,
			type: 'Tag' as const,
			tag,
			updatedAt: new Date(tag.updatedAt).getTime(),
		}))

		if (!query) {
			return {
				mentions: ([] as Mention[])
					.concat(allActors.sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 3))
					.concat(allEvents.sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 3))
					.concat(allArticles.sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 3))
					.concat(allTags.sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 3)),
				actorCount: allActors.length,
				eventCount: allEvents.length,
				articleCount: allArticles.length,
				tagCount: allTags.length,
			}
		}

		const filteredActors = allActors.filter((actor) => actor.name.toLowerCase().includes(query.toLowerCase()))
		const filteredEvents = allEvents.filter((event) => event.name.toLowerCase().includes(query.toLowerCase()))
		const filteredArticles = allArticles.filter((article) =>
			article.name.toLowerCase().includes(query.toLowerCase()),
		)
		const filteredTags = allTags.filter((tag) => tag.name.toLowerCase().includes(query.toLowerCase()))

		const mentions = ([] as Mention[])
			.concat(filteredActors)
			.concat(filteredEvents)
			.concat(filteredArticles)
			.concat(filteredTags)
			.sort((a, b) => b.updatedAt - a.updatedAt)
			.slice(0, 5)

		return {
			mentions,
			actorCount: filteredActors.length,
			eventCount: filteredEvents.length,
			articleCount: filteredArticles.length,
			tagCount: filteredTags.length,
		}
	}, [actors, events, articles, tags, query])

	return {
		mentions,
		actorCount,
		eventCount,
		articleCount,
		tagCount,
	}
}
