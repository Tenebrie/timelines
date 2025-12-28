import { MindmapNode } from '@api/types/mindmapTypes'
import { ActorDetails } from '@api/types/worldTypes'

import { ActorNodeContent } from './ActorNodeContent'
import { ActorNodeHotkeys } from './ActorNodeHotkeys'

type Props = {
	actor: ActorDetails
	node: MindmapNode
	isSelected: boolean
	onHeaderClick: () => void
	onContentClick: () => void
}

export function ActorNode({ actor, node, isSelected, onHeaderClick, onContentClick }: Props) {
	return (
		<>
			<ActorNodeHotkeys node={node} />
			<ActorNodeContent
				actor={actor}
				isSelected={isSelected}
				onHeaderClick={onHeaderClick}
				onContentClick={onContentClick}
			/>
		</>
	)
}
