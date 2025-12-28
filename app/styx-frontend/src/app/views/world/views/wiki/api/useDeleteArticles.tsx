import { useBulkDeleteArticlesMutation, worldWikiApi } from '@api/worldWikiApi'
import { useDispatch, useSelector } from 'react-redux'

import { parseApiResponse } from '@/app/utils/parseApiResponse'
import { wikiSlice } from '@/app/views/world/views/wiki/WikiSlice'
import { getWikiState } from '@/app/views/world/views/wiki/WikiSliceSelectors'
import { getWorldIdState } from '@/app/views/world/WorldSliceSelectors'

import { useArticleApiCache } from './useArticleApiCache'

export const useDeleteArticles = () => {
	const worldId = useSelector(getWorldIdState)
	const { bulkActionArticles } = useSelector(getWikiState)

	const [deleteArticle, params] = useBulkDeleteArticlesMutation()
	const { removeCachedArticles } = useArticleApiCache()

	const { removeFromBulkSelection, setBulkSelecting } = wikiSlice.actions
	const dispatch = useDispatch()

	const commit = async (articles: string[]) => {
		removeCachedArticles(articles)

		const { response, error } = parseApiResponse(
			await deleteArticle({
				worldId,
				body: {
					articles,
				},
			}),
		)
		if (error) {
			worldWikiApi.util.invalidateTags(['worldWiki'])
			return { response: null, error }
		}

		if (bulkActionArticles.length === articles.length) {
			dispatch(setBulkSelecting(false))
		}
		dispatch(removeFromBulkSelection({ articles }))

		return { response, error: null }
	}

	return [commit, params] as const
}
