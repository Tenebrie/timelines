import { UpdateNodeApiArg, useUpdateNodeMutation } from '@api/otherApi'
import { useCallback } from 'react'
import { useSelector } from 'react-redux'

import { parseApiResponse } from '@/app/utils/parseApiResponse'
import { getWorldIdState } from '@/app/views/world/WorldSliceSelectors'

export const useUpdateMindmapNode = () => {
	const worldId = useSelector(getWorldIdState)
	const [updateMindmapNode, state] = useUpdateNodeMutation()

	const perform = useCallback(
		async (nodeId: string, body: UpdateNodeApiArg['body']) => {
			const { response, error } = parseApiResponse(
				await updateMindmapNode({
					worldId,
					nodeId,
					body,
				}),
			)
			if (error) {
				return
			}
			return response
		},
		[updateMindmapNode, worldId],
	)

	return [perform, state] as const
}
