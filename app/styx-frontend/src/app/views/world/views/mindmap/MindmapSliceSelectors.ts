import { createSelector } from '@reduxjs/toolkit'

import { RootState } from '@/app/store'

export const getMindmapState = (state: RootState) => state.mindmap
const getSelectedNodes = (state: RootState) => state.mindmap.selectedNodes
const getSelectedWires = (state: RootState) => state.mindmap.selectedWires
export const getSelectedNodeKeys = createSelector([getSelectedNodes], (nodes) =>
	nodes.map((node) => node.key),
)
export const getSelectedNodeActorIds = createSelector([getSelectedNodes], (nodes) =>
	nodes.map((node) => node.actorId),
)
export const getSelectedWireKeys = createSelector([getSelectedWires], (wires) => wires.map((wire) => wire))
