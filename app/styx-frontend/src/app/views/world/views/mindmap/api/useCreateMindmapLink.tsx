import { CreateMindmapLinkApiArg, useCreateMindmapLinkMutation } from '@api/mindmapApi'
import { useCallback } from 'react'
import { useSelector } from 'react-redux'

import { parseApiResponse } from '@/app/utils/parseApiResponse'
import { getWorldIdState } from '@/app/views/world/WorldSliceSelectors'

export const useCreateMindmapLink = () => {
	const worldId = useSelector(getWorldIdState)
	const [createMindmapLink, state] = useCreateMindmapLinkMutation()

	const perform = useCallback(
		async (body: CreateMindmapLinkApiArg['body']) => {
			const { response, error } = parseApiResponse(
				await createMindmapLink({
					worldId,
					body,
				}),
			)
			if (error) {
				return
			}
			return response
		},
		[createMindmapLink, worldId],
	)

	return [perform, state] as const
}
