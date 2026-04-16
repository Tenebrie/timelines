import { useGetMindmapQuery } from '@api/mindmapApi'
import { MindmapNode } from '@api/types/mindmapTypes'
import { useCallback } from 'react'
import { useSelector } from 'react-redux'

import { getWorldIdState } from '../../../WorldSliceSelectors'
import { useCreateMindmapLink } from '../api/useCreateMindmapLink'
import { useDeleteMindmapLink } from '../api/useDeleteMindmapLink'

export function useNodeLinking() {
	const worldId = useSelector(getWorldIdState)
	const { data } = useGetMindmapQuery({ worldId }, { skip: !worldId })

	const [createMindmapLink] = useCreateMindmapLink()
	const [deleteMindmapLink] = useDeleteMindmapLink()

	const createLink = useCallback(
		({ source, target }: { source: MindmapNode; target: MindmapNode }) => {
			if (!data) {
				return
			}

			const existingLink = data.links.find(
				(link) =>
					(link.sourceNodeId === source.id && link.targetNodeId === target.id) ||
					(link.sourceNodeId === target.id && link.targetNodeId === source.id),
			)
			if (existingLink) {
				return deleteMindmapLink(existingLink.id)
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
