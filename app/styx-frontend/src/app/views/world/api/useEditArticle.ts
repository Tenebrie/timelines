import { useSelector } from 'react-redux'

import { useWikiApiCache } from '@/api/hooks/useWikiApiCache'
import { useUpdateArticleMutation } from '@/api/otherApi'
import { worldWikiApi } from '@/api/worldWikiApi'
import { parseApiResponse } from '@/app/utils/parseApiResponse'
import { getWorldIdState } from '@/app/views/world/WorldSliceSelectors'

export const useEditArticle = () => {
	const worldId = useSelector(getWorldIdState)
	const [updateArticle, params] = useUpdateArticleMutation()
	const { updateCachedArticle } = useWikiApiCache()

	const edit = async (data: { id: string; name?: string }) => {
		const { id, name } = data

		updateCachedArticle(data)

		const { response, error } = parseApiResponse(
			await updateArticle({
				articleId: id,
				worldId,
				body: {
					name,
				},
			}),
		)
		if (error) {
			worldWikiApi.util.invalidateTags(['worldWiki'])
			return
		}

		return response
	}

	return [edit, params] as const
}
