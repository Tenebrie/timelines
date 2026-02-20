import { useDeleteNodeMutation } from '@api/mindmapApi'
import { useCallback } from 'react'
import { useSelector } from 'react-redux'

import { parseApiResponse } from '@/app/utils/parseApiResponse'
import { getWorldIdState } from '@/app/views/world/WorldSliceSelectors'

export const useDeleteMindmapNode = () => {
	const worldId = useSelector(getWorldIdState)
	const [deleteMindmapNode, state] = useDeleteNodeMutation()

	const perform = useCallback(
		async (nodeId: string) => {
			const { response, error } = parseApiResponse(
				await deleteMindmapNode({
					worldId,
					nodeId,
				}),
			)
			if (error) {
				return
			}
			return response
		},
		[deleteMindmapNode, worldId],
	)

	return [perform, state] as const
}
