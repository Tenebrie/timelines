import { useDeleteNodesMutation } from '@api/mindmapApi'
import { useCallback } from 'react'
import { useSelector } from 'react-redux'

import { parseApiResponse } from '@/app/utils/parseApiResponse'
import { getWorldIdState } from '@/app/views/world/WorldSliceSelectors'

export const useDeleteMindmapNodes = () => {
	const worldId = useSelector(getWorldIdState)
	const [deleteMindmapNodes, state] = useDeleteNodesMutation()

	const perform = useCallback(
		async (nodes: string[]) => {
			const { response, error } = parseApiResponse(
				await deleteMindmapNodes({
					worldId,
					nodes,
				}),
			)
			if (error) {
				return
			}
			return response
		},
		[deleteMindmapNodes, worldId],
	)

	return [perform, state] as const
}
