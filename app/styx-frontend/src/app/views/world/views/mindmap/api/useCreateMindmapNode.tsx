import { CreateNodeApiArg, useCreateNodeMutation } from '@api/mindmapApi'
import { useCallback } from 'react'
import { useSelector } from 'react-redux'

import { parseApiResponse } from '@/app/utils/parseApiResponse'
import { getWorldIdState } from '@/app/views/world/WorldSliceSelectors'

export const useCreateMindmapNode = () => {
	const worldId = useSelector(getWorldIdState)
	const [createMindmapNode, state] = useCreateNodeMutation()

	const perform = useCallback(
		async (body: CreateNodeApiArg['body']) => {
			const { response, error } = parseApiResponse(
				await createMindmapNode({
					worldId,
					body,
				}),
			)
			if (error) {
				return
			}
			return response
		},
		[createMindmapNode, worldId],
	)

	return [perform, state] as const
}
