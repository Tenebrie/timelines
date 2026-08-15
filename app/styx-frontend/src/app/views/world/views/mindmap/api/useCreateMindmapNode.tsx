import { CreateNodeApiArg, mindmapApi, useCreateNodeMutation } from '@api/mindmapApi'
import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { AppDispatch } from '@/app/store'
import { parseApiResponse } from '@/app/utils/parseApiResponse'
import { getWorldIdState } from '@/app/views/world/WorldSliceSelectors'

export const useCreateMindmapNode = () => {
	const worldId = useSelector(getWorldIdState)
	const dispatch = useDispatch<AppDispatch>()
	const [createMindmapNode, state] = useCreateNodeMutation()

	const addCachedNode = useCallback(
		(id: string, body: CreateNodeApiArg['body']) => {
			return dispatch(
				mindmapApi.util.updateQueryData('getMindmap', { worldId }, (draft) => {
					draft.nodes.push({
						worldId,
						id,
						createdAt: new Date().toISOString(),
						updatedAt: new Date().toISOString(),
						parentActorId: body.parentActorId,
						positionX: body.positionX,
						positionY: body.positionY,
					})
				}),
			)
		},
		[dispatch, worldId],
	)

	const perform = useCallback(
		async (body: CreateNodeApiArg['body']) => {
			const patchResult = addCachedNode(body.id ?? `temp-${Math.random()}`, body)

			const { response, error } = parseApiResponse(
				await createMindmapNode({
					worldId,
					body,
				}),
			)
			patchResult.undo()
			if (error) {
				return
			}

			// Reapply patch to get the correct id
			addCachedNode(response.id, body)
			return response
		},
		[addCachedNode, createMindmapNode, worldId],
	)

	return [perform, state] as const
}
