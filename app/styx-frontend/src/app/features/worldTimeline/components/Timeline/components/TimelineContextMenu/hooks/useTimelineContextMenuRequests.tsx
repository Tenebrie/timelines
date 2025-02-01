import { useCallback } from 'react'
import { useDispatch } from 'react-redux'

import { useUpdateWorldEventMutation } from '@/api/worldEventApi'
import { worldSlice } from '@/app/features/world/reducer'
import { ingestEvent } from '@/app/utils/ingestEvent'
import { parseApiResponse } from '@/app/utils/parseApiResponse'

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
