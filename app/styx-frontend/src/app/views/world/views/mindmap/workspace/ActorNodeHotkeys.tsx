import { MindmapNode } from '@api/types/mindmapTypes'
import { useNavigate, useSearch } from '@tanstack/react-router'

import { Shortcut, useShortcut } from '@/app/hooks/useShortcut/useShortcut'

import { useDeleteMindmapNode } from '../api/useDeleteMindmapNode'

type Props = {
	node: MindmapNode
}

export function ActorNodeHotkeys({ node }: Props) {
	const selection = useSearch({
		from: '/world/$worldId/_world/mindmap',
		select: (search) => search.navi,
	})
	const navigate = useNavigate({
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
