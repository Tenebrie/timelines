import { useParams } from '@tanstack/react-router'
import { useMemo } from 'react'

import { useListArticles } from '../api/useListArticles'

export const useCurrentArticle = () => {
	const state = useParams({ from: '/world/$worldId/_world/wiki/_wiki/$articleId' })

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
