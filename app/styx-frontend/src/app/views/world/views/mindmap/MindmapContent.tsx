import { useGetMindmapQuery } from '@api/mindmapApi'
import Box from '@mui/material/Box'
import { useEffect, useMemo } from 'react'
import { useSelector } from 'react-redux'

import { dispatchGlobalEvent } from '@/app/features/eventBus'
import { getWorldState } from '@/app/views/world/WorldSliceSelectors'

import { getMindmapState } from './MindmapSliceSelectors'
import { ActorNodePositioner } from './workspace/ActorNodePositioner'
import { MindmapWireLayer } from './workspace/MindmapWireLayer'

function MindmapSelectionBridge() {
	const { selectedNodes, selectedWires } = useSelector(getMindmapState, (a, b) => {
		return a.selectedNodes === b.selectedNodes && a.selectedWires === b.selectedWires
	})

	useEffect(() => {
		dispatchGlobalEvent['mindmap/selection/changed']({
			selectedNodeIds: new Set(selectedNodes.map((n) => n.key)),
			selectedWireIds: new Set(selectedWires),
		})
	}, [selectedNodes, selectedWires])

	return null
}

export function MindmapContent() {
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
		<Box sx={{ zIndex: 1 }}>
			<MindmapSelectionBridge />
			<MindmapWireLayer actorsWithNodes={actorsWithNodes} />
			{actorsWithNodes.map((wrapper) => (
				<ActorNodePositioner key={wrapper.id} actor={wrapper.actor} node={wrapper.node} />
			))}
		</Box>
	)
}
