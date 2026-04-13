import { MindmapNode } from '@api/types/mindmapTypes'
import { ActorDetails } from '@api/types/worldTypes'
import Box from '@mui/material/Box'
import React from 'react'

import { useDragDropReceiver } from '@/app/features/dragDrop/hooks/useDragDropReceiver'

import { useNodeLinking } from '../hooks/useNodeLinking'
import { ActorNodeContent } from './ActorNodeContent'
import { ActorNodeHotkeys } from './ActorNodeHotkeys'
import { ActorNodeLinkMaker } from './ActorNodeLinkMaker'

type Props = {
	actor: ActorDetails
	node: MindmapNode
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
			<ActorNodeHotkeys node={node} />
			<ActorNodeContent actor={actor} onHeaderClick={onHeaderClick} onContentClick={onContentClick} />
			<Box sx={{ position: 'absolute', right: 16, top: 16 }}>
				<ActorNodeLinkMaker node={node} />
			</Box>
		</Box>
	)
}
