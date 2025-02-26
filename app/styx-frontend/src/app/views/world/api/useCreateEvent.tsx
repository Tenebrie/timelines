import { CreateWorldEventApiArg, useCreateWorldEventMutation } from '@api/worldEventApi'
import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { ingestEvent } from '@/app/utils/ingestEntity'
import { parseApiResponse } from '@/app/utils/parseApiResponse'
import { worldSlice } from '@/app/views/world/WorldSlice'
import { getWorldIdState } from '@/app/views/world/WorldSliceSelectors'

export const useCreateEvent = () => {
	const worldId = useSelector(getWorldIdState)
	const [createEvent, state] = useCreateWorldEventMutation()

	const { addEvent } = worldSlice.actions
	const dispatch = useDispatch()

	const perform = useCallback(
		async (body: CreateWorldEventApiArg['body']) => {
			const { response, error } = parseApiResponse(
				await createEvent({
					worldId,
					body,
				}),
			)
			if (error) {
				return
			}
			const event = ingestEvent(response)
			dispatch(addEvent(event))
			return event
		},
		[addEvent, createEvent, dispatch, worldId],
	)

	return [perform, state] as const
}
