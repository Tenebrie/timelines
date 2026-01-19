import { MindmapNode } from '@api/types/mindmapTypes'
import { useSearch } from '@tanstack/react-router'

import { Shortcut, useShortcut } from '@/app/hooks/useShortcut/useShortcut'
import { useStableNavigate } from '@/router-utils/hooks/useStableNavigate'

import { useDeleteMindmapNode } from '../api/useDeleteMindmapNode'

type Props = {
	node: MindmapNode
}

export function ActorNodeHotkeys({ node }: Props) {
	const selection = useSearch({
		from: '/world/$worldId/_world/mindmap',
		select: (search) => search.navi,
	})
	const navigate = useStableNavigate({
		from: '/world/$worldId/mindmap',
	})
	const [deleteMindmapNode] = useDeleteMindmapNode()

	useShortcut(
		Shortcut.DeleteSelected,
		() => {
			deleteMindmapNode(node.id)
			navigate({
				search: (prev) => ({
					...prev,
					navi: [],
				}),
			})
		},
		selection.includes(node.parentActorId!),
	)
	return null
}
