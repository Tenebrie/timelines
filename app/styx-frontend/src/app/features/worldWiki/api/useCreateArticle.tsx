import { otherApi, useCreateArticleMutation } from '@api/otherApi'
import { useDispatch, useSelector } from 'react-redux'

import { AppDispatch } from '@/app/store'
import { parseApiResponse } from '@/app/utils/parseApiResponse'

import { getWorldIdState } from '../../world/selectors'

export const useCreateArticle = () => {
	const worldId = useSelector(getWorldIdState)
	const [createArticle] = useCreateArticleMutation()

	const dispatch = useDispatch<AppDispatch>()

	const create = async ({ name }: { name: string }) => {
		const { response, error } = parseApiResponse(
			await createArticle({
				worldId,
				body: {
					name,
				},
			}),
		)
		if (error) {
			console.error(error)
			return
		}

		dispatch(
			otherApi.util.updateQueryData('getArticles', { worldId }, (articles) => {
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

	return {
		createArticle: create,
	}
}
