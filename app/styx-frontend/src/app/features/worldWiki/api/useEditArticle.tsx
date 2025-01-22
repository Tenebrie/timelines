import { otherApi, useUpdateArticleMutation } from '@api/otherApi'
import { useSelector } from 'react-redux'

import { parseApiResponse } from '@/app/utils/parseApiResponse'

import { getWorldIdState } from '../../world/selectors'
import { useArticleApiCache } from './useArticleApiCache'

export const useEditArticle = () => {
	const worldId = useSelector(getWorldIdState)
	const [updateArticle, params] = useUpdateArticleMutation()
	const { updateCachedArticle } = useArticleApiCache()

	const edit = async (data: {
		id: string
		name?: string
		contentRich?: string
		mentionedActors?: string[]
		mentionedEvents?: string[]
		mentionedTags?: string[]
	}) => {
		const { id, name, contentRich, mentionedActors, mentionedEvents, mentionedTags } = data

		updateCachedArticle(data)

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
