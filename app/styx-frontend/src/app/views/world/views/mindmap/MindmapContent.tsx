import { useGetMindmapQuery } from '@api/mindmapApi'
import Box from '@mui/material/Box'
import { useMemo } from 'react'
import { useSelector } from 'react-redux'

import { getWorldState } from '@/app/views/world/WorldSliceSelectors'

import { ActorNodePositioner } from './workspace/ActorNodePositioner'

const ActorList = () => {
	const { id: worldId, actors } = useSelector(getWorldState, (a, b) => a.id === b.id && a.actors === b.actors)
	const { data } = useGetMindmapQuery({ worldId }, { skip: !worldId })

	const actorsWithNodes = useMemo(() => {
		if (!data) {
			return []
		}
		return data.nodes
			.map((node) => {
				const actor = actors.find((a) => a.id === node.parentActorId)
				if (!actor) {
					return null
				}
				return {
					id: node.id,
					actor,
					node,
				}
			})
			.filter((node) => node !== null)
			.map((node) => node as NonNullable<typeof node>)
	}, [data, actors])

	if (!data) {
		return null
	}

	return (
		<>
			{actorsWithNodes.map((wrapper) => (
				<ActorNodePositioner key={wrapper.id} actor={wrapper.actor} node={wrapper.node} />
			))}
		</>
	)
}

export function MindmapContent() {
	return (
		<Box sx={{ zIndex: 1 }}>
			<ActorList />
		</Box>
	)
}
