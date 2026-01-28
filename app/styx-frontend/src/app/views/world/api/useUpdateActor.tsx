import { UpdateActorApiArg, useUpdateActorMutation } from '@api/actorListApi'
import { ActorDetails } from '@api/types/worldTypes'
import { worldDetailsApi } from '@api/worldDetailsApi'
import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { ingestActor } from '@/app/utils/ingestEntity'
import { parseApiResponse } from '@/app/utils/parseApiResponse'
import { worldSlice } from '@/app/views/world/WorldSlice'
import { getWorldIdState, getWorldState } from '@/app/views/world/WorldSliceSelectors'

export const useUpdateActor = () => {
	const worldId = useSelector(getWorldIdState)
	const { actors } = useSelector(getWorldState, (a, b) => a.actors === b.actors)
	const [updateWorldActor, state] = useUpdateActorMutation()

	const { updateActor } = worldSlice.actions
	const dispatch = useDispatch()

	const perform = useCallback(
		async (id: string, body: UpdateActorApiArg['body'], onBeforeSave?: (actor: ActorDetails) => void) => {
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

			const actor = ingestActor(response)
			onBeforeSave?.(actor)

			// Invalidate common icons query cache if icon has changed
			const oldIcon = actors.find((e) => e.id === id)?.icon
			if (body.icon !== undefined && body.icon !== oldIcon) {
				dispatch(worldDetailsApi.util.invalidateTags([{ type: 'worldCommonIcons' }]))
			}

			dispatch(updateActor(actor))

			return actor
		},
		[dispatch, updateActor, updateWorldActor, worldId, actors],
	)

	return [perform, state] as const
}
