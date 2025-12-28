import { useDeleteWorldEventMutation } from '@api/worldEventApi'
import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { parseApiResponse } from '@/app/utils/parseApiResponse'
import { worldSlice } from '@/app/views/world/WorldSlice'
import { getWorldIdState } from '@/app/views/world/WorldSliceSelectors'

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
