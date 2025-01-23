import { useCreateWorldEventMutation } from '@api/worldEventApi'
import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { worldSlice } from '@/app/features/world/reducer'
import { getWorldIdState } from '@/app/features/world/selectors'
import { ingestEvent } from '@/app/utils/ingestEvent'
import { parseApiResponse } from '@/app/utils/parseApiResponse'

export const useQuickCreateEvent = () => {
	const worldId = useSelector(getWorldIdState)
	const [createEvent] = useCreateWorldEventMutation()

	const { addEvent } = worldSlice.actions
	const dispatch = useDispatch()

	const quickCreateEvent = useCallback(
		async ({ query }: { query: string }) => {
			if (query.length === 0) {
				return
			}

			const { response, error } = parseApiResponse(
				await createEvent({
					worldId,
					body: {
						name: query,
						type: 'SCENE',
						timestamp: '0',
					},
				}),
			)
			if (error) {
				return null
			}
			dispatch(addEvent(ingestEvent(response)))
			return response
		},
		[addEvent, createEvent, dispatch, worldId],
	)

	return quickCreateEvent
}
