import { MoveWikiEntityApiArg, useMoveWikiEntityMutation, worldWikiApi } from '@api/worldWikiApi'
import { useSelector } from 'react-redux'

import { parseApiResponse } from '@/app/utils/parseApiResponse'
import { getWorldIdState } from '@/app/views/world/WorldSliceSelectors'

export function useMoveArticle() {
	const worldId = useSelector(getWorldIdState)
	const [moveEntity, params] = useMoveWikiEntityMutation()

	// const { updateCachedArticlePosition } = useArticleApiCache()
	const commit = async (data: MoveWikiEntityApiArg['body']) => {
		// updateCachedArticlePosition(data)
		const { response, error } = parseApiResponse(
			await moveEntity({
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
