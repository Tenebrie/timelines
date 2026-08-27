import { mindmapApi, useDeleteMindmapWiresMutation } from '@api/mindmapApi'
import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { AppDispatch } from '@/app/store'
import { parseApiResponse } from '@/app/utils/parseApiResponse'
import { getWorldIdState } from '@/app/views/world/WorldSliceSelectors'

export function useDeleteMindmapWires() {
	const worldId = useSelector(getWorldIdState)
	const dispatch = useDispatch<AppDispatch>()
	const [deleteMindmapWires, state] = useDeleteMindmapWiresMutation()

	const optimisticUpdate = useCallback(
		(wires: string[]) => {
			return dispatch(
				mindmapApi.util.updateQueryData('getMindmap', { worldId }, (draft) => {
					draft.wires = draft.wires.filter((wire) => !wires.includes(wire.id))
				}),
			)
		},
		[dispatch, worldId],
	)

	const perform = useCallback(
		async (wires: string[]) => {
			const patchResult = optimisticUpdate(wires)

			const { response, error } = parseApiResponse(
				await deleteMindmapWires({
					worldId,
					wires,
				}),
			)
			if (error) {
				mindmapApi.util.invalidateTags(['mindmapWire'])
				patchResult.undo()
				return
			}
			return response
		},
		[deleteMindmapWires, optimisticUpdate, worldId],
	)

	return [perform, state] as const
}
