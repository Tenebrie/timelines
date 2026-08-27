import { useSelector, useStore } from 'react-redux'

import { useWikiApiCache } from '@/api/hooks/useWikiApiCache'
import { worldDetailsApi } from '@/api/worldDetailsApi'
import { BulkMoveWikiEntitiesApiArg, useBulkMoveWikiEntitiesMutation, worldWikiApi } from '@/api/worldWikiApi'
import { RootState } from '@/app/store'
import { parseApiResponse } from '@/app/utils/parseApiResponse'
import { getWorldIdState } from '@/app/views/world/WorldSliceSelectors'

import { getOrderedWikiEntities } from '../views/wiki/WikiSliceSelectors'

export function useBulkWikiMove() {
	const worldId = useSelector(getWorldIdState)
	const [moveEntities, params] = useBulkMoveWikiEntitiesMutation()

	const { applyPositionUpdates } = useWikiApiCache()
	const store = useStore<RootState>()

	const commit = async (data: BulkMoveWikiEntitiesApiArg['body']) => {
		const ordered = getOrderedWikiEntities(store.getState()).filter((entity) =>
			data.entityIds.includes(entity.id),
		)
		const sortedEntityIds = ordered.map((entity) => entity.id)
		const { response, error } = parseApiResponse(
			await moveEntities({
				worldId,
				body: {
					...data,
					entityIds: sortedEntityIds,
				},
			}),
		)
		if (error) {
			worldDetailsApi.util.invalidateTags(['worldDetails'])
			worldWikiApi.util.invalidateTags(['worldWiki'])
			return
		}

		applyPositionUpdates(response.updates)
		return response
	}

	return [commit, params] as const
}
