import { CreateMindmapWireApiArg, mindmapApi, useCreateMindmapWireMutation } from '@api/mindmapApi'
import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { AppDispatch } from '@/app/store'
import { parseApiResponse } from '@/app/utils/parseApiResponse'
import { getWorldIdState } from '@/app/views/world/WorldSliceSelectors'

export function useCreateMindmapWire() {
	const worldId = useSelector(getWorldIdState)
	const dispatch = useDispatch<AppDispatch>()
	const [createMindmapWire, state] = useCreateMindmapWireMutation()

	const updateCachedWires = useCallback(
		(id: string, body: CreateMindmapWireApiArg['body']) => {
			return dispatch(
				mindmapApi.util.updateQueryData('getMindmap', { worldId }, (draft) => {
					draft.wires.push({
						id,
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
		async (body: CreateMindmapWireApiArg['body']) => {
			const patchResult = updateCachedWires('temp', body)

			const { response, error } = parseApiResponse(
				await createMindmapWire({
					worldId,
					body,
				}),
			)
			patchResult.undo()
			if (error) {
				return
			}
			updateCachedWires(response.id, body)
			return response
		},
		[createMindmapWire, updateCachedWires, worldId],
	)

	return [perform, state] as const
}
