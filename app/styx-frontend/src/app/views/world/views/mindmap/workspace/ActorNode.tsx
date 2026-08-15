import { MindmapNode } from '@api/types/mindmapTypes'
import Box from '@mui/material/Box'
import React from 'react'
import { useStore } from 'react-redux'

import { useDragDropReceiver } from '@/app/features/dragDrop/hooks/useDragDropReceiver'
import { RootState } from '@/app/store'

import { BoxedWikiEntity } from '../../wiki/hooks/useBoxedWikiContent'
import { useNodeLinking } from '../hooks/useNodeLinking'
import { getSelectedNodeKeys } from '../MindmapSliceSelectors'
import { ActorNodeContent } from './ActorNodeContent'

type Props = {
	node: MindmapNode
	parent: BoxedWikiEntity
	onHeaderClick: (e: React.MouseEvent) => void
	onContentClick: () => void
}

export function ActorNode({ parent, node, onHeaderClick, onContentClick }: Props) {
	const { createLinks } = useNodeLinking()
	const store = useStore<RootState>()

	const { ref } = useDragDropReceiver({
		type: 'actorNodeLinking',
		onDrop: (data) => {
			const selectedNodeKeys = getSelectedNodeKeys(store.getState())
			const sourceNodeId = data.params.sourceNode.id
			const sourceIds = selectedNodeKeys.includes(sourceNodeId)
				? [...new Set(selectedNodeKeys)]
				: [sourceNodeId]

			createLinks(
				sourceIds.map((srcId) => ({
					sourceNodeId: srcId,
					targetNodeId: node.id,
				})),
			)
		},
	})

	return (
		<Box ref={ref}>
			<ActorNodeContent
				node={node}
				parent={parent}
				onHeaderClick={onHeaderClick}
				onContentClick={onContentClick}
			/>
		</Box>
	)
}
