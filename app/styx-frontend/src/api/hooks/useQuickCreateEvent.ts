import { CreateWorldEventApiArg } from '@api/worldEventApi'
import { useCallback } from 'react'

import { useCreateEvent } from '@/app/views/world/api/useCreateEvent'

export const useQuickCreateEvent = () => {
	const [createEvent] = useCreateEvent()

	return useCallback(
		async ({
			query,
			...body
		}: { query: string } & Omit<CreateWorldEventApiArg['body'], 'name' | 'contentRich' | 'timestamp'>) => {
			if (query.length === 0) {
				return
			}
			return (await createEvent({ ...body, name: query, contentRich: '', timestamp: '0' })) ?? null
		},
		[createEvent],
	)
}
