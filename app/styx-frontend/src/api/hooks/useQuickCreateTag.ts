import { useCallback } from 'react'

import { CreateTagApiArg } from '@/api/worldTagApi'
import { useCreateTag } from '@/app/views/world/api/useCreateTag'

export const useQuickCreateTag = () => {
	const [createTag] = useCreateTag()

	return useCallback(
		async ({ query, ...body }: { query: string } & Omit<CreateTagApiArg['body'], 'name'>) => {
			if (query.length === 0) {
				return
			}
			return (await createTag({ ...body, name: query })) ?? null
		},
		[createTag],
	)
}
