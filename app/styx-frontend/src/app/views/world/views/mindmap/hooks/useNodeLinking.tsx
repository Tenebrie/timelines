import { useGetMindmapQuery } from '@api/mindmapApi'
import { useCallback } from 'react'
import { useSelector } from 'react-redux'

import { getWorldIdState } from '../../../WorldSliceSelectors'
import { useCreateMindmapWires } from '../api/useCreateMindmapWires'
import { useDeleteMindmapWires } from '../api/useDeleteMindmapWires'

export function useNodeLinking() {
	const worldId = useSelector(getWorldIdState)
	const { data } = useGetMindmapQuery({ worldId }, { skip: !worldId })

	const [createMindmapWires] = useCreateMindmapWires()
	const [deleteMindmapWires] = useDeleteMindmapWires()

	const createLink = useCallback(
		({ sourceId, targetId }: { sourceId: string; targetId: string }) => {
			if (!data) {
				return
			}

			const existingLink = data.wires.find(
				(link) =>
					(link.sourceNodeId === sourceId && link.targetNodeId === targetId) ||
					(link.sourceNodeId === targetId && link.targetNodeId === sourceId),
			)
			if (existingLink) {
				return deleteMindmapWires([existingLink.id])
			}
			const newLink = createMindmapWires([
				{
					sourceNodeId: sourceId,
					targetNodeId: targetId,
				},
			])
			return newLink
		},
		[createMindmapWires, data, deleteMindmapWires],
	)

	const createLinks = useCallback(
		(newPairs: { sourceNodeId: string; targetNodeId: string }[]) => {
			if (!data) {
				return
			}

			const existingLinks = newPairs
				.map(({ sourceNodeId, targetNodeId }) =>
					data.wires.find((link) => {
						const isMatching =
							link.sourceNodeId === sourceNodeId &&
							link.targetNodeId === targetNodeId &&
							link.direction === 'Normal'
						const isReversedMatching =
							link.sourceNodeId === targetNodeId &&
							link.targetNodeId === sourceNodeId &&
							link.direction === 'Reversed'
						return isMatching || isReversedMatching
					}),
				)
				.filter((link): link is NonNullable<typeof link> => !!link)

			if (existingLinks.length === newPairs.length) {
				return deleteMindmapWires(existingLinks.map((link) => link.id))
			}

			return createMindmapWires(newPairs)
		},
		[createMindmapWires, data, deleteMindmapWires],
	)

	return {
		createLink,
		createLinks,
	}
}
