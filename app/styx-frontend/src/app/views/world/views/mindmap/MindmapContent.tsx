import { useGetMindmapQuery } from '@api/mindmapApi'
import Box from '@mui/material/Box'
import { useMemo } from 'react'
import { useSelector } from 'react-redux'

import { getWorldState } from '@/app/views/world/WorldSliceSelectors'

import { ActorLinkPositioner } from './workspace/ActorLinkPositioner'
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

	const nodeLinks = useMemo(() => {
		if (!data) {
			return []
		}

		return data.links
			.map((link) => {
				const sourceNode = actorsWithNodes.find((node) => node.id === link.sourceNodeId)
				const targetNode = actorsWithNodes.find((node) => node.id === link.targetNodeId)
				if (!sourceNode || !targetNode) {
					return null
				}
				return {
					...link,
					sourceNode,
					targetNode,
				}
			})
			.filter((link): link is NonNullable<typeof link> => link !== null)
	}, [data, actorsWithNodes])

	if (!data) {
		return null
	}

	return (
		<>
			{nodeLinks.map((link) => (
				<ActorLinkPositioner key={link.id} link={link} source={link.sourceNode} target={link.targetNode} />
			))}
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
