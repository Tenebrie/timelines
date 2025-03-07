import Box from '@mui/material/Box'
import { useSelector } from 'react-redux'

import { getWorldState } from '@/app/views/world/WorldSliceSelectors'

import { ActorNode } from './workspace/ActorNode'

export function MindmapContent() {
	const { actors } = useSelector(getWorldState, (a, b) => a.actors === b.actors)

	return (
		<Box sx={{ zIndex: 1 }}>
			{actors.map((actor, index) => (
				<ActorNode key={actor.id} index={index} actor={actor} />
			))}
		</Box>
	)
}
