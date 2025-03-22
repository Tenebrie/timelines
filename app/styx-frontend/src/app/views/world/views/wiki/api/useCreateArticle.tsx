import { useCreateArticleMutation, worldWikiApi } from '@api/worldWikiApi'
import { useDispatch, useSelector } from 'react-redux'

import { AppDispatch } from '@/app/store'
import { parseApiResponse } from '@/app/utils/parseApiResponse'
import { getWorldIdState } from '@/app/views/world/WorldSliceSelectors'

export const useCreateArticle = () => {
	const worldId = useSelector(getWorldIdState)
	const [createArticle, params] = useCreateArticleMutation()

	const dispatch = useDispatch<AppDispatch>()

	const commit = async ({ name }: { name: string }) => {
		const { response, error } = parseApiResponse(
			await createArticle({
				worldId,
				body: {
					name,
				},
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
