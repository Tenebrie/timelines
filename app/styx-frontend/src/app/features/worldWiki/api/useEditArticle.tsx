import { otherApi, useUpdateArticleMutation } from '@api/otherApi'
import { useDispatch, useSelector } from 'react-redux'

import { AppDispatch } from '@/app/store'
import { parseApiResponse } from '@/app/utils/parseApiResponse'

import { getWorldIdState } from '../../world/selectors'

export const useEditArticle = () => {
	const worldId = useSelector(getWorldIdState)
	const [updateArticle, params] = useUpdateArticleMutation()

	const dispatch = useDispatch<AppDispatch>()

	const edit = async (data: {
		id: string
		name?: string
		contentRich?: string
		mentionedActors?: string[]
		mentionedEvents?: string[]
		mentionedTags?: string[]
	}) => {
		const { id, name, contentRich, mentionedActors, mentionedEvents, mentionedTags } = data

		dispatch(
			otherApi.util.updateQueryData('getArticles', { worldId }, (draft) => {
				return draft.map((article) => {
					if (article.id !== id) {
						return article
					}

					return {
						...article,
						...data,
					}
				})
			}),
		)

		const { response, error } = parseApiResponse(
			await updateArticle({
				articleId: id,
				worldId,
				body: {
					name,
					contentRich,
					mentionedActors,
					mentionedEvents,
					mentionedTags,
				},
			}),
		)
		if (error) {
			otherApi.util.invalidateTags(['worldWiki'])
			return
		}

		return response
	}

	return [edit, params] as const
}
