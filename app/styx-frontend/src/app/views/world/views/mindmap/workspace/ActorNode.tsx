import { MindmapNode } from '@api/types/mindmapTypes'
import { ActorDetails } from '@api/types/worldTypes'
import Box from '@mui/material/Box'
import React from 'react'

import { useDragDropReceiver } from '@/app/features/dragDrop/hooks/useDragDropReceiver'

import { useNodeLinking } from '../hooks/useNodeLinking'
import { ActorNodeContent } from './ActorNodeContent'

type Props = {
	node: MindmapNode
	actor: ActorDetails
	onHeaderClick: (e: React.MouseEvent) => void
	onContentClick: () => void
}

export function ActorNode({ actor, node, onHeaderClick, onContentClick }: Props) {
	const { createLink } = useNodeLinking()

	const { ref } = useDragDropReceiver({
		type: 'actorNodeLinking',
		onDrop: (data) => {
			createLink({ source: data.params.sourceNode, target: node })
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
