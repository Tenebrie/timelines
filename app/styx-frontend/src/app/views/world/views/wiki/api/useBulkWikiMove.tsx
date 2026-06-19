import { useWikiApiCache } from '@api/hooks/useWikiApiCache'
import { worldDetailsApi } from '@api/worldDetailsApi'
import { BulkMoveWikiEntitiesApiArg, useBulkMoveWikiEntitiesMutation, worldWikiApi } from '@api/worldWikiApi'
import { useDispatch, useSelector } from 'react-redux'

import { parseApiResponse } from '@/app/utils/parseApiResponse'
import { getWorldIdState } from '@/app/views/world/WorldSliceSelectors'

import { wikiSlice } from '../WikiSlice'

export function useBulkWikiMove() {
	const worldId = useSelector(getWorldIdState)
	const [moveEntities, params] = useBulkMoveWikiEntitiesMutation()

	const { applyPositionUpdates } = useWikiApiCache()

	const { setBulkSelecting } = wikiSlice.actions
	const dispatch = useDispatch()

	const commit = async (data: BulkMoveWikiEntitiesApiArg['body']) => {
		const { response, error } = parseApiResponse(
			await moveEntities({
				worldId,
				body: data,
			}),
		)
		if (error) {
			worldDetailsApi.util.invalidateTags(['worldDetails'])
			worldWikiApi.util.invalidateTags(['worldWiki'])
			return
		}

		applyPositionUpdates(response.updates)
		dispatch(setBulkSelecting(false))
		return response
	}

	return [commit, params] as const
}
