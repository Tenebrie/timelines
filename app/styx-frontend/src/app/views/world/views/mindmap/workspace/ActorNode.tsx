import { MindmapNode } from '@api/types/mindmapTypes'
import { ActorDetails } from '@api/types/worldTypes'
import React from 'react'

import { ActorNodeContent } from './ActorNodeContent'
import { ActorNodeHotkeys } from './ActorNodeHotkeys'

type Props = {
	actor: ActorDetails
	node: MindmapNode
	onHeaderClick: (e: React.MouseEvent) => void
	onContentClick: () => void
}

export function ActorNode({ actor, node, onHeaderClick, onContentClick }: Props) {
	return (
		<>
			<ActorNodeHotkeys node={node} />
			<ActorNodeContent actor={actor} onHeaderClick={onHeaderClick} onContentClick={onContentClick} />
		</>
	)
}
