import { useDeleteMindmapLinkMutation } from '@api/mindmapApi'
import { useCallback } from 'react'
import { useSelector } from 'react-redux'

import { parseApiResponse } from '@/app/utils/parseApiResponse'
import { getWorldIdState } from '@/app/views/world/WorldSliceSelectors'

export const useDeleteMindmapLink = () => {
	const worldId = useSelector(getWorldIdState)
	const [deleteMindmapLink, state] = useDeleteMindmapLinkMutation()

	const perform = useCallback(
		async (linkId: string) => {
			const { response, error } = parseApiResponse(
				await deleteMindmapLink({
					worldId,
					linkId,
				}),
			)
			if (error) {
				return
			}
			return response
		},
		[deleteMindmapLink, worldId],
	)

	return [perform, state] as const
}
