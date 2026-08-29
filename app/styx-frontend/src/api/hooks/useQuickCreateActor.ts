import { useCallback } from 'react'

import { CreateActorApiArg } from '@/api/actorListApi'
import { useCreateActor } from '@/app/views/world/api/useCreateActor'

export function useQuickCreateActor() {
	const [createActor] = useCreateActor()

	return useCallback(
		async ({ query, ...body }: { query: string } & Omit<CreateActorApiArg['body'], 'name'>) => {
			return await createActor({
				...body,
				name: query || 'Unnamed Actor',
			})
		},
		[createActor],
	)
}
