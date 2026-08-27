import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { useWikiApiCache } from '@/api/hooks/useWikiApiCache'
import { UpdateArticleApiArg, useUpdateArticleMutation } from '@/api/otherApi'
import { worldDetailsApi } from '@/api/worldDetailsApi'
import { useGetArticlesQuery } from '@/api/worldWikiApi'
import { parseApiResponse } from '@/app/utils/parseApiResponse'
import { getWorldIdState } from '@/app/views/world/WorldSliceSelectors'

export function useUpdateArticle() {
	const worldId = useSelector(getWorldIdState)
	const { data: articles = [] } = useGetArticlesQuery({ worldId })
	const [updateArticle, state] = useUpdateArticleMutation()
	const { updateCachedArticle } = useWikiApiCache()

	const dispatch = useDispatch()

	const perform = useCallback(
		async (id: string, body: UpdateArticleApiArg['body']) => {
			const { response, error } = parseApiResponse(
				await updateArticle({
					worldId,
					articleId: id,
					body,
				}),
			)
			if (error) {
				return
			}

			// Invalidate common icons query cache if icon has changed
			const oldIcon = articles.find((e) => e.id === id)?.icon
			if (body.icon !== undefined && body.icon !== oldIcon) {
				dispatch(worldDetailsApi.util.invalidateTags([{ type: 'worldCommonIcons' }]))
			}

			updateCachedArticle(response)

			return response
		},
		[articles, dispatch, updateArticle, updateCachedArticle, worldId],
	)

	return [perform, state] as const
}
