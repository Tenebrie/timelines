import { otherApi, useBulkDeleteArticlesMutation } from '@api/otherApi'
import { useDispatch, useSelector } from 'react-redux'

import { parseApiResponse } from '@/app/utils/parseApiResponse'

import { getWorldIdState } from '../../world/selectors'
import { wikiSlice } from '../reducer'
import { getWikiState } from '../selectors'
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
			otherApi.util.invalidateTags(['worldWiki'])
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
