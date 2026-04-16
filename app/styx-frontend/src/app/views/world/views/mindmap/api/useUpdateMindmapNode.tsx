import { mindmapApi } from '@api/mindmapApi'
import { UpdateNodeApiArg, useUpdateNodeMutation } from '@api/otherApi'
import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { AppDispatch } from '@/app/store'
import { parseApiResponse } from '@/app/utils/parseApiResponse'
import { getWorldIdState } from '@/app/views/world/WorldSliceSelectors'

export const useUpdateMindmapNode = () => {
	const worldId = useSelector(getWorldIdState)
	const dispatch = useDispatch<AppDispatch>()
	const [updateMindmapNode, state] = useUpdateNodeMutation()

	const updateCachedNode = useCallback(
		(nodeId: string, body: UpdateNodeApiArg['body']) => {
			return dispatch(
				mindmapApi.util.updateQueryData('getMindmap', { worldId }, (draft) => {
					const node = draft.nodes.find((n) => n.id === nodeId)
					if (node) {
						if (body.positionX !== undefined) {
							node.positionX = body.positionX
						}
						if (body.positionY !== undefined) {
							node.positionY = body.positionY
						}
					}
				}),
			)
		},
		[dispatch, worldId],
	)

	const perform = useCallback(
		async (nodeId: string, body: UpdateNodeApiArg['body']) => {
			const patchResult = updateCachedNode(nodeId, body)

			const { response, error } = parseApiResponse(
				await updateMindmapNode({
					worldId,
					nodeId,
					body,
				}),
			)
			if (error) {
				patchResult.undo()
				return
			}
			return response
		},
		[updateCachedNode, updateMindmapNode, worldId],
	)

	return [perform, state] as const
}
