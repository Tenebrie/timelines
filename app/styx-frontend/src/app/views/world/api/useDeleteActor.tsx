import { useDeleteActorMutation } from '@api/actorListApi'
import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { parseApiResponse } from '@/app/utils/parseApiResponse'
import { worldSlice } from '@/app/views/world/WorldSlice'
import { getWorldIdState } from '@/app/views/world/WorldSliceSelectors'

export const useDeleteActor = () => {
	const worldId = useSelector(getWorldIdState)
	const [deleteActor, state] = useDeleteActorMutation()

	const { removeEvent } = worldSlice.actions
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
			dispatch(removeEvent(actorId))
			return true
		},
		[deleteActor, worldId, dispatch, removeEvent],
	)

	return [perform, state] as const
}
