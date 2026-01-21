import { MindmapNode } from '@api/types/mindmapTypes'
import { useSelector } from 'react-redux'

import { Shortcut, useShortcut } from '@/app/hooks/useShortcut/useShortcut'
import { getSelectedNodeKeys } from '@/app/views/world/WorldSliceSelectors'
import { useStableNavigate } from '@/router-utils/hooks/useStableNavigate'

import { useDeleteMindmapNode } from '../api/useDeleteMindmapNode'

type Props = {
	node: MindmapNode
}

export function ActorNodeHotkeys({ node }: Props) {
	const selection = useSelector(getSelectedNodeKeys)
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
		selection.includes(node.id),
	)
	return null
}
