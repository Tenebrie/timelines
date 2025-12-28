import { MoveArticleApiArg, useMoveArticleMutation, worldWikiApi } from '@api/worldWikiApi'
import { useSelector } from 'react-redux'

import { parseApiResponse } from '@/app/utils/parseApiResponse'
import { getWorldIdState } from '@/app/views/world/WorldSliceSelectors'

import { useArticleApiCache } from './useArticleApiCache'

export const useMoveArticle = () => {
	const worldId = useSelector(getWorldIdState)
	const [moveArticle, params] = useMoveArticleMutation()
	const { updateCachedArticlePosition } = useArticleApiCache()

	const commit = async (data: MoveArticleApiArg['body']) => {
		updateCachedArticlePosition(data)

		const { response, error } = parseApiResponse(
			await moveArticle({
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
