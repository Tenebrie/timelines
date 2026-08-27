import { useCallback } from 'react'

import { useCreateArticle } from '@/app/views/world/api/useCreateArticle'

import { CreateArticleApiArg } from '../worldWikiApi'

export function useQuickCreateArticle() {
	const [createArticle] = useCreateArticle()

	return useCallback(
		async ({ query, ...body }: { query: string } & Omit<CreateArticleApiArg['body'], 'name'>) => {
			return await createArticle({
				...body,
				name: query || 'Unnamed Article',
			})
		},
		[createArticle],
	)
}
