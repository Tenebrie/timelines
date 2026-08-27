import { useCallback } from 'react'

import { CreateWorldEventApiArg } from '@/api/worldEventApi'
import { useCreateEvent } from '@/app/views/world/api/useCreateEvent'

export function useQuickCreateEvent() {
	const [createEvent] = useCreateEvent()

	return useCallback(
		async ({
			query,
			...body
		}: { query: string } & Omit<CreateWorldEventApiArg['body'], 'name' | 'contentRich' | 'timestamp'>) => {
			return await createEvent({
				...body,
				name: query || 'Unnamed Event',
				contentRich: '',
				timestamp: '0',
			})
		},
		[createEvent],
	)
}
