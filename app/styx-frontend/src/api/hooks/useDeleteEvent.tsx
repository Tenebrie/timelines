import { useDeleteWorldEventMutation } from '@api/worldEventApi'
import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { worldSlice } from '@/app/features/world/reducer'
import { getWorldIdState } from '@/app/features/world/selectors'
import { parseApiResponse } from '@/app/utils/parseApiResponse'

export const useDeleteEvent = () => {
	const worldId = useSelector(getWorldIdState)
	const [deleteEvent, state] = useDeleteWorldEventMutation()

	const { removeEvent } = worldSlice.actions
	const dispatch = useDispatch()

	const perform = useCallback(
		async (eventId: string) => {
			const { error } = parseApiResponse(
				await deleteEvent({
					worldId,
					eventId,
				}),
			)
			if (error) {
				return
			}
			dispatch(removeEvent(eventId))
			return true
		},
		[removeEvent, deleteEvent, dispatch, worldId],
	)

	return [perform, state] as const
}
