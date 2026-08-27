import { CreateActorApiArg } from '@api/actorListApi'
import { useCallback } from 'react'

import { useCreateActor } from '@/app/views/world/api/useCreateActor'

export const useQuickCreateActor = () => {
	const [createActor] = useCreateActor()

	return useCallback(
		async ({ query, ...body }: { query: string } & Omit<CreateActorApiArg['body'], 'name'>) => {
			return (await createActor({ ...body, name: query.length > 0 ? query : 'Unnamed Actor' })) ?? null
		},
		[createActor],
	)
}
