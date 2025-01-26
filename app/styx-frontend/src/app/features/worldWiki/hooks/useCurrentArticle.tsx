import { useMemo } from 'react'

import { useWorldWikiRouter, worldWikiRoutes } from '@/router/routes/featureRoutes/worldWikiRoutes'

import { useListArticles } from '../api/useListArticles'

export const useCurrentArticle = () => {
	const { stateOf } = useWorldWikiRouter()
	const state = stateOf(worldWikiRoutes.article)

	const id = state.articleId
	const { data: articles } = useListArticles()

	const article = useMemo(() => {
		return articles?.find((a) => a.id === id)
	}, [articles, id])

	return {
		id,
		worldId: state.worldId,
		article,
	}
}
