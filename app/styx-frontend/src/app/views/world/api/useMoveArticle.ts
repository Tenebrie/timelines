import { useSelector } from 'react-redux'

import { useWikiApiCache } from '@/api/hooks/useWikiApiCache'
import { WikiEntityType } from '@/api/types/worldTypes'
import { worldDetailsApi } from '@/api/worldDetailsApi'
import { MoveWikiEntityApiArg, useMoveWikiEntityMutation, worldWikiApi } from '@/api/worldWikiApi'
import { parseApiResponse } from '@/app/utils/parseApiResponse'
import { getWorldIdState } from '@/app/views/world/WorldSliceSelectors'

export function useMoveArticle() {
	const worldId = useSelector(getWorldIdState)
	const [moveEntity, params] = useMoveWikiEntityMutation()

	const { applyPositionUpdates } = useWikiApiCache()

	const commit = async (data: MoveWikiEntityApiArg['body'] & { entityType: WikiEntityType }) => {
		const transaction = applyPositionUpdates([
			{
				entityId: data.entityId,
				entityType: data.entityType,
				position: data.position,
				folderId: data.parentId,
			},
		])

		const { response, error } = parseApiResponse(
			await moveEntity({
				worldId,
				body: data,
			}),
		)
		if (error) {
			transaction.undo()
			worldDetailsApi.util.invalidateTags(['worldDetails'])
			worldWikiApi.util.invalidateTags(['worldWiki'])
			return
		}

		applyPositionUpdates(response.updates)
		return response
	}

	return [commit, params] as const
}
