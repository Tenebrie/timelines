import { useBulkDeleteEntitiesMutation } from '@api/worldBulkApi'
import { worldWikiApi } from '@api/worldWikiApi'
import { useDispatch, useSelector } from 'react-redux'

import { parseApiResponse } from '@/app/utils/parseApiResponse'
import { wikiSlice } from '@/app/views/world/views/wiki/WikiSlice'
import { getWikiState } from '@/app/views/world/views/wiki/WikiSliceSelectors'
import { getWorldIdState } from '@/app/views/world/WorldSliceSelectors'

import { useArticleApiCache } from './useArticleApiCache'

export function useBulkDelete() {
	const worldId = useSelector(getWorldIdState)
	const { bulkActionArticles } = useSelector(getWikiState)

	const [deleteArticle, params] = useBulkDeleteEntitiesMutation()
	const { removeCachedArticles } = useArticleApiCache()

	const { removeFromBulkSelection, setBulkSelecting } = wikiSlice.actions
	const dispatch = useDispatch()

	const commit = async (entities: string[]) => {
		removeCachedArticles(entities)

		const { response, error } = parseApiResponse(
			await deleteArticle({
				worldId,
				body: {
					entities,
				},
			}),
		)
		if (error) {
			worldWikiApi.util.invalidateTags(['worldWiki'])
			return { response: null, error }
		}

		if (bulkActionArticles.length === entities.length) {
			dispatch(setBulkSelecting(false))
		}
		dispatch(removeFromBulkSelection({ articles: entities }))

		return { response, error: null }
	}

	return [commit, params] as const
}
