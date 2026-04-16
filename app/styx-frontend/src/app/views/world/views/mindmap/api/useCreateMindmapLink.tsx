import { CreateMindmapLinkApiArg, mindmapApi, useCreateMindmapLinkMutation } from '@api/mindmapApi'
import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { AppDispatch } from '@/app/store'
import { parseApiResponse } from '@/app/utils/parseApiResponse'
import { getWorldIdState } from '@/app/views/world/WorldSliceSelectors'

export const useCreateMindmapLink = () => {
	const worldId = useSelector(getWorldIdState)
	const dispatch = useDispatch<AppDispatch>()
	const [createMindmapLink, state] = useCreateMindmapLinkMutation()

	const updateCachedLinks = useCallback(
		(body: CreateMindmapLinkApiArg['body']) => {
			return dispatch(
				mindmapApi.util.updateQueryData('getMindmap', { worldId }, (draft) => {
					draft.links.push({
						id: crypto.randomUUID(),
						createdAt: new Date().toISOString(),
						updatedAt: new Date().toISOString(),
						sourceNodeId: body.sourceNodeId,
						targetNodeId: body.targetNodeId,
						direction: 'Normal',
						content: '',
					})
				}),
			)
		},
		[dispatch, worldId],
	)

	const perform = useCallback(
		async (body: CreateMindmapLinkApiArg['body']) => {
			const patchResult = updateCachedLinks(body)

			const { response, error } = parseApiResponse(
				await createMindmapLink({
					worldId,
					body,
				}),
			)
			if (error) {
				patchResult.undo()
				return
			}
			return response
		},
		[createMindmapLink, updateCachedLinks, worldId],
	)

	return [perform, state] as const
}
