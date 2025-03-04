import { useCreateWorldEventMutation } from '@api/worldEventApi'
import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { getRandomEntityColor } from '@/app/utils/colors/getRandomEntityColor'
import { ingestEvent } from '@/app/utils/ingestEntity'
import { parseApiResponse } from '@/app/utils/parseApiResponse'
import { worldSlice } from '@/app/views/world/WorldSlice'
import { getWorldIdState } from '@/app/views/world/WorldSliceSelectors'

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
						color: getRandomEntityColor(),
						description: query,
						descriptionRich: query,
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
