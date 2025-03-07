import { CreateActorApiArg, useCreateActorMutation } from '@api/actorListApi'
import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { ingestActor } from '@/app/utils/ingestEntity'
import { parseApiResponse } from '@/app/utils/parseApiResponse'
import { worldSlice } from '@/app/views/world/WorldSlice'
import { getWorldIdState } from '@/app/views/world/WorldSliceSelectors'

export const useCreateActor = () => {
	const worldId = useSelector(getWorldIdState)
	const [createActor, state] = useCreateActorMutation()

	const { addActor } = worldSlice.actions
	const dispatch = useDispatch()

	const perform = useCallback(
		async (body: CreateActorApiArg['body']) => {
			const { response, error } = parseApiResponse(
				await createActor({
					worldId,
					body,
				}),
			)
			if (error) {
				return
			}
			const actor = ingestActor(response)
			dispatch(addActor(actor))
			return actor
		},
		[addActor, createActor, dispatch, worldId],
	)

	return [perform, state] as const
}
