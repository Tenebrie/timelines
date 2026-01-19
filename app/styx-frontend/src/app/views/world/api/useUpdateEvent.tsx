import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { worldDetailsApi } from '@/api/worldDetailsApi'
import { UpdateWorldEventApiArg, useUpdateWorldEventMutation } from '@/api/worldEventApi'
import { ingestEvent } from '@/app/utils/ingestEntity'
import { parseApiResponse } from '@/app/utils/parseApiResponse'
import { worldSlice } from '@/app/views/world/WorldSlice'
import { getWorldIdState, getWorldState } from '@/app/views/world/WorldSliceSelectors'

export const useUpdateEvent = () => {
	const worldId = useSelector(getWorldIdState)
	const events = useSelector(getWorldState, (a, b) => a.events === b.events).events
	const [updateWorldEvent, state] = useUpdateWorldEventMutation()

	const { updateEvent } = worldSlice.actions
	const dispatch = useDispatch()

	const perform = useCallback(
		async (id: string, body: UpdateWorldEventApiArg['body']) => {
			const { response, error } = parseApiResponse(
				await updateWorldEvent({
					worldId,
					eventId: id,
					body,
				}),
			)
			if (error) {
				return
			}

			// Invalidate common icons query cache if icon has changed
			const oldIcon = events.find((e) => e.id === id)?.icon
			if (body.icon !== undefined && body.icon !== oldIcon) {
				dispatch(worldDetailsApi.util.invalidateTags([{ type: 'worldCommonIcons' }]))
			}

			const event = ingestEvent(response)
			dispatch(updateEvent(event))

			return event
		},
		[dispatch, updateEvent, updateWorldEvent, worldId, events],
	)

	return [perform, state] as const
}
