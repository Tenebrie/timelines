import { useGetMindmapQuery } from '@api/mindmapApi'
import { MindmapNode } from '@api/types/mindmapTypes'
import { useCallback } from 'react'
import { useSelector } from 'react-redux'

import { getWorldIdState } from '../../../WorldSliceSelectors'
import { useCreateMindmapWire } from '../api/useCreateMindmapWire'
import { useDeleteMindmapWires } from '../api/useDeleteMindmapWires'

export function useNodeLinking() {
	const worldId = useSelector(getWorldIdState)
	const { data } = useGetMindmapQuery({ worldId }, { skip: !worldId })

	const [createMindmapLink] = useCreateMindmapWire()
	const [deleteMindmapLink] = useDeleteMindmapWires()

	const createLink = useCallback(
		({ source, target }: { source: MindmapNode; target: MindmapNode }) => {
			if (!data) {
				return
			}

			const existingLink = data.wires.find(
				(link) =>
					(link.sourceNodeId === source.id && link.targetNodeId === target.id) ||
					(link.sourceNodeId === target.id && link.targetNodeId === source.id),
			)
			if (existingLink) {
				return deleteMindmapLink([existingLink.id])
			}
			const newLink = createMindmapLink({
				sourceNodeId: source.id,
				targetNodeId: target.id,
			})
			return newLink
		},
		[createMindmapLink, data, deleteMindmapLink],
	)

	return {
		createLink,
	}
}
