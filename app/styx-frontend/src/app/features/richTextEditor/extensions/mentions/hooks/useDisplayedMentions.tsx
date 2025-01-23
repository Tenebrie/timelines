import { useMemo } from 'react'
import { useSelector } from 'react-redux'

import { getWorldState } from '@/app/features/world/selectors'
import { Actor, WorldEvent } from '@/app/features/worldTimeline/types'
import { useListArticles } from '@/app/features/worldWiki/api/useListArticles'
import { WikiArticle } from '@/app/features/worldWiki/types'

type Props = {
	query: string
}

export const useDisplayedMentions = ({ query }: Props) => {
	const { data: articles } = useListArticles()

	const { actors, events } = useSelector(
		getWorldState,
		(a, b) => a.actors === b.actors && a.events === b.events,
	)

	const displayedMentions = useMemo(() => {
		if (!articles) {
			return []
		}

		type Mention = {
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
		)

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

		if (!query) {
			return ([] as Mention[])
				.concat(allActors.sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 3))
				.concat(allEvents.sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 3))
				.concat(allArticles.sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 3))
		}

		return ([] as Mention[])
			.concat(allActors)
			.concat(allEvents)
			.concat(allArticles)
			.filter((entity) => entity.name.toLowerCase().includes(query.toLowerCase()))
	}, [actors, events, articles, query])

	return {
		mentions: displayedMentions,
	}
}
