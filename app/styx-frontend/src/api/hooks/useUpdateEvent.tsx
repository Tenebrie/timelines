import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { UpdateWorldEventApiArg, useUpdateWorldEventMutation } from '@/api/worldEventApi'
import { worldSlice } from '@/app/features/world/reducer'
import { getWorldIdState } from '@/app/features/world/selectors'
import { ingestEvent } from '@/app/utils/ingestEvent'
import { parseApiResponse } from '@/app/utils/parseApiResponse'

export const useUpdateEvent = () => {
	const worldId = useSelector(getWorldIdState)
	const [updateWorldEvent, state] = useUpdateWorldEventMutation()

	const { updateEvent } = worldSlice.actions
	const dispatch = useDispatch()

	const perform = useCallback(
		async (id: string, delta: UpdateWorldEventApiArg['body']) => {
			const { response, error } = parseApiResponse(
				await updateWorldEvent({
					worldId: worldId,
					eventId: id,
					body: delta,
				}),
			)
			if (error) {
				return
			}
			const event = ingestEvent(response)
			dispatch(updateEvent(event))
			return event
		},
		[dispatch, updateEvent, updateWorldEvent, worldId],
	)

	return [perform, state] as const
}
