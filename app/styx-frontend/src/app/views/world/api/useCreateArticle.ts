import { useDispatch, useSelector } from 'react-redux'

import { CreateArticleApiArg, useCreateArticleMutation, worldWikiApi } from '@/api/worldWikiApi'
import { AppDispatch } from '@/app/store'
import { parseApiResponse } from '@/app/utils/parseApiResponse'
import { getWorldIdState } from '@/app/views/world/WorldSliceSelectors'

export function useCreateArticle() {
	const worldId = useSelector(getWorldIdState)
	const [createArticle, params] = useCreateArticleMutation()

	const dispatch = useDispatch<AppDispatch>()

	const commit = async (body: CreateArticleApiArg['body']) => {
		const { response, error } = parseApiResponse(
			await createArticle({
				worldId,
				body,
			}),
		)
		if (error) {
			return
		}

		dispatch(
			worldWikiApi.util.updateQueryData('getArticles', { worldId }, (articles) => {
				return articles.map((article) => {
					if (article.id === response.id) {
						return {
							...article,
							...response,
						}
					}
					return article
				})
			}),
		)

		return response
	}

	return [commit, params] as const
}
