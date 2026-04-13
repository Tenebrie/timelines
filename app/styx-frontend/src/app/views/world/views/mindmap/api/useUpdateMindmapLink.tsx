import { UpdateMindmapLinkApiArg, useUpdateMindmapLinkMutation } from '@api/mindmapApi'
import { useCallback } from 'react'
import { useSelector } from 'react-redux'

import { parseApiResponse } from '@/app/utils/parseApiResponse'
import { getWorldIdState } from '@/app/views/world/WorldSliceSelectors'

export const useUpdateMindmapLink = () => {
	const worldId = useSelector(getWorldIdState)
	const [updateMindmapLink, state] = useUpdateMindmapLinkMutation()

	const perform = useCallback(
		async (linkId: string, body: UpdateMindmapLinkApiArg['body']) => {
			const { response, error } = parseApiResponse(
				await updateMindmapLink({
					worldId,
					linkId,
					body,
				}),
			)
			if (error) {
				return
			}
			return response
		},
		[updateMindmapLink, worldId],
	)

	return [perform, state] as const
}
