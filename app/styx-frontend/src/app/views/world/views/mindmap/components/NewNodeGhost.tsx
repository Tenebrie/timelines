import Box from '@mui/material/Box'

import { BoxedWikiEntity } from '../../wiki/hooks/useBoxedWikiContent'
import { getHoveredMindmapClickArea } from '../utils/getHoveredMindmapClickArea'
import { ActorNodeContent } from '../workspace/ActorNodeContent'

type Props = {
	entityHandle: BoxedWikiEntity
}

export function NewNodeGhost({ entityHandle }: Props) {
	const hoveredMindmapClickArea = getHoveredMindmapClickArea()
	if (!hoveredMindmapClickArea || entityHandle.type !== 'actor') {
		return null
	}
	const style = getComputedStyle(hoveredMindmapClickArea)
	const scale = parseFloat(style.getPropertyValue('--grid-scale'))
	return (
		<Box sx={{ transform: `scale(${scale})` }}>
			<ActorNodeContent actor={entityHandle.entity} />
		</Box>
	)
}
