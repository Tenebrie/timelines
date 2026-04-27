import { MindmapNode } from '@api/types/mindmapTypes'
import { ActorDetails } from '@api/types/worldTypes'
import Box from '@mui/material/Box'
import React from 'react'
import { useStore } from 'react-redux'

import { useDragDropReceiver } from '@/app/features/dragDrop/hooks/useDragDropReceiver'
import { RootState } from '@/app/store'

import { useNodeLinking } from '../hooks/useNodeLinking'
import { getSelectedNodeKeys } from '../MindmapSliceSelectors'
import { ActorNodeContent } from './ActorNodeContent'

type Props = {
	node: MindmapNode
	actor: ActorDetails
	onHeaderClick: (e: React.MouseEvent) => void
	onContentClick: () => void
}

export function ActorNode({ actor, node, onHeaderClick, onContentClick }: Props) {
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
				actor={actor}
				onHeaderClick={onHeaderClick}
				onContentClick={onContentClick}
			/>
		</Box>
	)
}
