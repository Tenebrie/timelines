import { useCallback } from 'react'
import { useDispatch } from 'react-redux'

import { useUpdateWorldEventMutation } from '@/api/worldEventApi'
import { ingestEvent } from '@/app/utils/ingestEntity'
import { parseApiResponse } from '@/app/utils/parseApiResponse'
import { worldSlice } from '@/app/views/world/WorldSlice'

export const useTimelineContextMenuRequests = () => {
	const [updateWorldEvent, { isLoading: isRequestInFlight }] = useUpdateWorldEventMutation()

	const { updateEvent } = worldSlice.actions
	const dispatch = useDispatch()

	const revokeEventAt = useCallback(
		async ({ worldId, eventId, revokedAt }: { worldId: string; eventId: string; revokedAt: number }) => {
			const { response, error } = parseApiResponse(
				await updateWorldEvent({
					body: {
						revokedAt: String(revokedAt),
					},
					worldId,
					eventId,
				}),
			)
			if (error) {
				return
			}
			dispatch(updateEvent(ingestEvent(response)))
		},
		[dispatch, updateEvent, updateWorldEvent],
	)

	const unrevokeEventAt = useCallback(
		async ({ worldId, eventId }: { worldId: string; eventId: string }) => {
			const { response, error } = parseApiResponse(
				await updateWorldEvent({
					body: {
						revokedAt: null,
					},
					worldId,
					eventId,
				}),
			)
			if (error) {
				return
			}
			dispatch(updateEvent(ingestEvent(response)))
		},
		[dispatch, updateEvent, updateWorldEvent],
	)

	return {
		revokeEventAt,
		unrevokeEventAt,
		isRequestInFlight,
	}
}
