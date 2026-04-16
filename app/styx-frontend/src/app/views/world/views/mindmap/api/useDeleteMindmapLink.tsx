import { mindmapApi, useDeleteMindmapLinkMutation } from '@api/mindmapApi'
import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { AppDispatch } from '@/app/store'
import { parseApiResponse } from '@/app/utils/parseApiResponse'
import { getWorldIdState } from '@/app/views/world/WorldSliceSelectors'

export const useDeleteMindmapLink = () => {
	const worldId = useSelector(getWorldIdState)
	const dispatch = useDispatch<AppDispatch>()
	const [deleteMindmapLink, state] = useDeleteMindmapLinkMutation()

	const updateCachedLinks = useCallback(
		(linkId: string) => {
			return dispatch(
				mindmapApi.util.updateQueryData('getMindmap', { worldId }, (draft) => {
					draft.links = draft.links.filter((link) => link.id !== linkId)
				}),
			)
		},
		[dispatch, worldId],
	)

	const perform = useCallback(
		async (linkId: string) => {
			const patchResult = updateCachedLinks(linkId)

			const { response, error } = parseApiResponse(
				await deleteMindmapLink({
					worldId,
					linkId,
				}),
			)
			if (error) {
				patchResult.undo()
				return
			}
			return response
		},
		[deleteMindmapLink, updateCachedLinks, worldId],
	)

	return [perform, state] as const
}
