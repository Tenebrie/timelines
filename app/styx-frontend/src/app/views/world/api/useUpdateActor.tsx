import { UpdateActorApiArg, useUpdateActorMutation } from '@api/actorListApi'
import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { ingestActor } from '@/app/utils/ingestEntity'
import { parseApiResponse } from '@/app/utils/parseApiResponse'
import { worldSlice } from '@/app/views/world/WorldSlice'
import { getWorldIdState } from '@/app/views/world/WorldSliceSelectors'

export const useUpdateActor = () => {
	const worldId = useSelector(getWorldIdState)
	const [updateWorldActor, state] = useUpdateActorMutation()

	const { updateActor } = worldSlice.actions
	const dispatch = useDispatch()

	const perform = useCallback(
		async (id: string, body: UpdateActorApiArg['body']) => {
			const { response, error } = parseApiResponse(
				await updateWorldActor({
					worldId,
					actorId: id,
					body,
				}),
			)
			if (error) {
				return
			}
			const event = ingestActor(response)
			dispatch(updateActor(event))
			return event
		},
		[dispatch, updateActor, updateWorldActor, worldId],
	)

	return [perform, state] as const
}
