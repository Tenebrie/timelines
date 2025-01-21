import { useCreateActorMutation } from '@api/actorListApi'
import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { worldSlice } from '@/app/features/world/reducer'
import { getWorldIdState } from '@/app/features/world/selectors'
import { hslToHex } from '@/app/utils/colors/hslToHex'
import { parseApiResponse } from '@/app/utils/parseApiResponse'

export const useQuickCreateActor = () => {
	const worldId = useSelector(getWorldIdState)
	const [createActor] = useCreateActorMutation()

	const { addActor } = worldSlice.actions
	const dispatch = useDispatch()

	const quickCreateActor = useCallback(
		async ({ query }: { query: string }) => {
			const { response, error } = parseApiResponse(
				await createActor({
					worldId,
					body: {
						name: query.length > 0 ? query : 'Unnamed Actor',
						color: hslToHex(Math.random(), 0.5, 0.5),
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
