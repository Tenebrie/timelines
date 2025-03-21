import { SwapArticlePositionsApiArg, useSwapArticlePositionsMutation, worldWikiApi } from '@api/worldWikiApi'
import { useSelector } from 'react-redux'

import { parseApiResponse } from '@/app/utils/parseApiResponse'
import { useListArticles } from '@/app/views/world/api/useListArticles'
import { getWorldIdState } from '@/app/views/world/WorldSliceSelectors'

import { useArticleApiCache } from './useArticleApiCache'

export const useSwapArticlePositions = () => {
	const worldId = useSelector(getWorldIdState)
	const { data: articles } = useListArticles()
	const [swapArticles, params] = useSwapArticlePositionsMutation()
	const { updateCachedArticle } = useArticleApiCache()

	const commit = async (data: SwapArticlePositionsApiArg['body']) => {
		const articleA = articles?.find((article) => article.id === data.articleA)
		const articleB = articles?.find((article) => article.id === data.articleB)
		if (articleA && articleB) {
			updateCachedArticle({
				id: articleA.id,
				position: articleB.position,
			})
			updateCachedArticle({
				id: articleB.id,
				position: articleA.position,
			})
		}

		const { response, error } = parseApiResponse(
			await swapArticles({
				worldId,
				body: data,
			}),
		)
		if (error) {
			worldWikiApi.util.invalidateTags(['worldWiki'])
			return
		}

		return response
	}

	return [commit, params] as const
}
