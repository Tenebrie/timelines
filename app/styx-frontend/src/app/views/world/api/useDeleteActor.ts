import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { useDeleteActorMutation } from '@/api/actorListApi'
import { parseApiResponse } from '@/app/utils/parseApiResponse'
import { worldSlice } from '@/app/views/world/WorldSlice'
import { getWorldIdState } from '@/app/views/world/WorldSliceSelectors'

export const useDeleteActor = () => {
	const worldId = useSelector(getWorldIdState)
	const [deleteActor, state] = useDeleteActorMutation()

	const { removeActor } = worldSlice.actions
	const dispatch = useDispatch()

	const perform = useCallback(
		async (actorId: string) => {
			const { error } = parseApiResponse(
				await deleteActor({
					worldId,
					actorId,
				}),
			)
			if (error) {
				return
			}
			dispatch(removeActor(actorId))
			return true
		},
		[deleteActor, worldId, dispatch, removeActor],
	)

	return [perform, state] as const
}
