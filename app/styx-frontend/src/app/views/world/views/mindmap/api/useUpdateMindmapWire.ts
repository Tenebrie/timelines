import { mindmapApi, UpdateMindmapWireApiArg, useUpdateMindmapWireMutation } from '@api/mindmapApi'
import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { AppDispatch } from '@/app/store'
import { parseApiResponse } from '@/app/utils/parseApiResponse'
import { getWorldIdState } from '@/app/views/world/WorldSliceSelectors'

export function useUpdateMindmapWire() {
	const worldId = useSelector(getWorldIdState)
	const dispatch = useDispatch<AppDispatch>()
	const [updateMindmapWire, state] = useUpdateMindmapWireMutation()

	const updateCachedWire = useCallback(
		(wireId: string, body: UpdateMindmapWireApiArg['body']) => {
			return dispatch(
				mindmapApi.util.updateQueryData('getMindmap', { worldId }, (draft) => {
					const wire = draft.wires.find((w) => w.id === wireId)
					if (wire) {
						if (body.direction !== undefined) {
							wire.direction = body.direction
						}
						if (body.content !== undefined) {
							wire.content = body.content
						}
					}
				}),
			)
		},
		[dispatch, worldId],
	)

	const perform = useCallback(
		async (wireId: string, body: UpdateMindmapWireApiArg['body']) => {
			const patchResult = updateCachedWire(wireId, body)

			const { response, error } = parseApiResponse(
				await updateMindmapWire({
					worldId,
					wireId,
					body,
				}),
			)
			if (error) {
				patchResult.undo()
				return
			}
			return response
		},
		[updateCachedWire, updateMindmapWire, worldId],
	)

	return [perform, state] as const
}
