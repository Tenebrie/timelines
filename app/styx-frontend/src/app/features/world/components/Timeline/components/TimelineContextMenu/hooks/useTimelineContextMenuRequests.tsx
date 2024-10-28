import { useCallback } from 'react'

import { useUpdateWorldEventMutation } from '../../../../../../../../api/rheaApi'
import { parseApiResponse } from '../../../../../../../utils/parseApiResponse'

export const useTimelineContextMenuRequests = () => {
	const [updateWorldEvent, { isLoading: isRequestInFlight }] = useUpdateWorldEventMutation()

	const revokeEventAt = useCallback(
		async ({ worldId, eventId, revokedAt }: { worldId: string; eventId: string; revokedAt: number }) => {
			const { error } = parseApiResponse(
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
		},
		[updateWorldEvent],
	)

	const unrevokeEventAt = useCallback(
		async ({ worldId, eventId }: { worldId: string; eventId: string }) => {
			const { error } = parseApiResponse(
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
		},
		[updateWorldEvent],
	)

	return {
		revokeEventAt,
		unrevokeEventAt,
		isRequestInFlight,
	}
}
