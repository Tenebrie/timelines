import { CreateActorApiArg, useCreateActorMutation } from '@api/actorListApi'
import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { parseApiResponse } from '@/app/utils/parseApiResponse'
import { worldSlice } from '@/app/views/world/WorldSlice'
import { getWorldIdState } from '@/app/views/world/WorldSliceSelectors'

export const useQuickCreateActor = () => {
	const worldId = useSelector(getWorldIdState)
	const [createActor] = useCreateActorMutation()

	const { addActor } = worldSlice.actions
	const dispatch = useDispatch()

	const quickCreateActor = useCallback(
		async ({ query, ...body }: { query: string } & Omit<CreateActorApiArg['body'], 'name'>) => {
			const { response, error } = parseApiResponse(
				await createActor({
					worldId,
					body: {
						...body,
						name: query.length > 0 ? query : 'Unnamed Actor',
					},
				}),
			)
			if (error) {
				return null
			}
			dispatch(addActor(response))

			return response
		},
		[addActor, createActor, dispatch, worldId],
	)

	return quickCreateActor
}
