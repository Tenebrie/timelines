import Box from '@mui/material/Box'
import { useEffect } from 'react'
import { useSelector } from 'react-redux'

import { dispatchGlobalEvent } from '@/app/features/eventBus'

import { useBoxedMindmapContent } from './hooks/useBoxedMindmapContent'
import { getMindmapState } from './MindmapSliceSelectors'
import { ActorNodePositioner } from './workspace/ActorNodePositioner'
import { MindmapWireLayer } from './workspace/MindmapWireLayer'

export function MindmapContent() {
	const { actorsWithNodes, nodeLinks, existingWires } = useBoxedMindmapContent()

	if (actorsWithNodes.length === 0) {
		return null
	}

	return (
		<Box sx={{ zIndex: 1 }}>
			<MindmapSelectionBridge />
			<MindmapWireLayer nodeLinks={nodeLinks} existingWires={existingWires} />
			{actorsWithNodes.map((wrapper) => (
				<ActorNodePositioner key={wrapper.id} parent={wrapper.parent} node={wrapper.node} />
			))}
		</Box>
	)
}

function MindmapSelectionBridge() {
	const { selectedNodes, selectedWires } = useSelector(getMindmapState, (a, b) => {
		return a.selectedNodes === b.selectedNodes && a.selectedWires === b.selectedWires
	})
	const { hoveredNodes, hoveredWires } = useSelector(getMindmapState, (a, b) => {
		return a.hoveredNodes === b.hoveredNodes && a.hoveredWires === b.hoveredWires
	})

	useEffect(() => {
		dispatchGlobalEvent['mindmap/selection/changed']({
			selectedNodeIds: new Set(selectedNodes.map((n) => n.key)),
			selectedWireIds: new Set(selectedWires),
		})
	}, [selectedNodes, selectedWires])

	useEffect(() => {
		dispatchGlobalEvent['mindmap/hover/changed']({
			hoveredNodeIds: new Set(hoveredNodes.map((n) => n.key)),
			hoveredWireIds: new Set(hoveredWires),
		})
	}, [hoveredNodes, hoveredWires, selectedNodes, selectedWires])

	return null
}
