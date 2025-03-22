import Box from '@mui/material/Box'
import { useSelector } from 'react-redux'

import { getWorldState } from '@/app/views/world/WorldSliceSelectors'

import { ActorNodePositioner } from './workspace/ActorNodePositioner'

export function MindmapContent() {
	const { actors } = useSelector(getWorldState, (a, b) => a.actors === b.actors)

	return (
		<Box sx={{ zIndex: 1 }}>
			{actors.map((actor) => (
				<ActorNodePositioner key={actor.id} actor={actor} />
			))}
		</Box>
	)
}
