import { MindmapNode } from '@api/types/mindmapTypes'
import { ActorDetails } from '@api/types/worldTypes'

type Props = {
	node: MindmapNode
	actor: ActorDetails
}

export function ActorNodeLinkSlot({ node, actor }: Props) {
	return <div style={{ width: 24, height: 24, background: 'gold', borderRadius: '50%' }} />
}
