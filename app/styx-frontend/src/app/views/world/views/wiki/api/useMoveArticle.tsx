import { MoveArticleApiArg, otherApi, useMoveArticleMutation } from '@api/otherApi'
import { useSelector } from 'react-redux'

import { parseApiResponse } from '@/app/utils/parseApiResponse'
import { useListArticles } from '@/app/views/world/api/useListArticles'
import { getWorldIdState } from '@/app/views/world/WorldSliceSelectors'

import { useArticleApiCache } from './useArticleApiCache'

export const useMoveArticle = () => {
	const worldId = useSelector(getWorldIdState)
	const { data: articles } = useListArticles()
	const [moveArticle, params] = useMoveArticleMutation()
	const { updateCachedArticle } = useArticleApiCache()

	const commit = async (data: MoveArticleApiArg['body']) => {
		const article = articles?.find((article) => article.id === data.articleId)
		if (article) {
			// updateCachedArticle({
			// 	id: article.id,
			// 	position: data.position,
			// })
		}

		const { response, error } = parseApiResponse(
			await moveArticle({
				worldId,
				body: data,
			}),
		)
		if (error) {
			otherApi.util.invalidateTags(['worldWiki'])
			return
		}

		return response
	}

	return [commit, params] as const
}
