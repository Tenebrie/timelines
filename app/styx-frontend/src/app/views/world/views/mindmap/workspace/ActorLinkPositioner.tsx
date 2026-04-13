import { MindmapLink, MindmapNode } from '@api/types/mindmapTypes'
import { ActorDetails } from '@api/types/worldTypes'
import Box from '@mui/material/Box'

import { ActorNodeLink } from './ActorNodeLink'

type Props = {
	link: MindmapLink
	source: {
		node: MindmapNode
		actor: ActorDetails
	}
	target: {
		node: MindmapNode
		actor: ActorDetails
	}
}

export function ActorLinkPositioner({ link, source, target }: Props) {
	return (
		<Box
			data-mindmap-link={link.id}
			sx={{
				position: 'absolute',
				inset: 0,
				pointerEvents: 'none',
				overflow: 'visible',
			}}
		>
			<ActorNodeLink link={link} source={source} target={target} />
		</Box>
	)
}
