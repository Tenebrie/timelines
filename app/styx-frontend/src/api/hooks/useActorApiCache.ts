import { ActorDetails } from '@api/types/worldTypes'
import { worldDetailsApi } from '@api/worldDetailsApi'
import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { AppDispatch } from '@/app/store'
import { getWorldIdState } from '@/app/views/world/WorldSliceSelectors'

export function useActorApiCache() {
	const dispatch = useDispatch<AppDispatch>()
	const worldId = useSelector(getWorldIdState)

	const updateCachedActor = useCallback(
		(actor: Partial<ActorDetails>) => {
			dispatch(
				worldDetailsApi.util.updateQueryData('getWorldInfo', { worldId }, (draft) => {
					const index = draft.actors.findIndex((a) => a.id === actor.id)
					if (index >= 0) {
						draft.actors[index] = {
							...draft.actors[index],
							...actor,
						}
					}
				}),
			)
		},
		[dispatch, worldId],
	)

	return { updateCachedActor }
}
