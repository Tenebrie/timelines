import { useCallback } from 'react'

import { CreateTagApiArg } from '@/api/worldTagApi'
import { useCreateTag } from '@/app/views/world/api/useCreateTag'

export function useQuickCreateTag() {
	const [createTag] = useCreateTag()

	return useCallback(
		async ({ query, ...body }: { query: string } & Omit<CreateTagApiArg['body'], 'name'>) => {
			return await createTag({
				...body,
				name: query || 'Unnamed Tag',
			})
		},
		[createTag],
	)
}
