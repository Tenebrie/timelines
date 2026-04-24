import { createSelector } from '@reduxjs/toolkit'

import { RootState } from '@/app/store'

export const getMindmapState = (state: RootState) => state.mindmap
export const getSelectedNodeKeys = createSelector([getMindmapState], (state) =>
	state.selectedNodes.map((node) => node.key),
)
export const getSelectedNodeActorIds = createSelector([getMindmapState], (state) =>
	state.selectedNodes.map((node) => node.actorId),
)
export const getSelectedWireKeys = createSelector([getMindmapState], (state) =>
	state.selectedWires.map((node) => node),
)
