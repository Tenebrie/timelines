import { MindmapNode } from '@api/types/mindmapTypes'
import { ActorDetails } from '@api/types/worldTypes'

import { ActorNodeContent } from './ActorNodeContent'
import { ActorNodeHotkeys } from './ActorNodeHotkeys'

type Props = {
	actor: ActorDetails
	node: MindmapNode
	isSelected: boolean
}

export function ActorNode({ actor, node, isSelected }: Props) {
	return (
		<>
			<ActorNodeHotkeys node={node} />
			<ActorNodeContent actor={actor} isSelected={isSelected} />
		</>
	)
}
