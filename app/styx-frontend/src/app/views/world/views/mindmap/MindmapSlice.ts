import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export const initialState = {
	selectedNodes: [] as { key: string; actorId: string }[],
	selectedWires: [] as string[],
	hoveredNodes: [] as { key: string; entityId: string }[],
	hoveredWires: [] as string[],
}

export const mindmapSlice = createSlice({
	name: 'mindmap',
	initialState,
	reducers: {
		addNodeToSelection: (
			state,
			{ payload }: PayloadAction<{ key: string; actorId: string; multiselect: boolean }>,
		) => {
			const record = { key: payload.key, actorId: payload.actorId }
			if (!payload.multiselect) {
				state.selectedNodes = [record]
				return
			}

			if (state.selectedNodes.some((m) => m.key === payload.key)) {
				return
			}
			state.selectedNodes = [...state.selectedNodes, record]
		},
		setNodeSelection: (state, { payload }: PayloadAction<{ key: string; actorId: string }[]>) => {
			if (
				state.selectedNodes.length === payload.length &&
				state.selectedNodes.every((node, index) => node.key === payload[index].key)
			) {
				return
			}
			state.selectedNodes = payload.reduce(
				(unique, current) => {
					if (!unique.some((node) => node.key === current.key)) {
						unique.push(current)
					}
					return unique
				},
				[] as { key: string; actorId: string }[],
			)
		},
		removeNodeFromSelection: (state, { payload }: PayloadAction<string>) => {
			state.selectedNodes = state.selectedNodes.filter((marker) => marker.key !== payload)
		},

		addWireToSelection: (state, { payload }: PayloadAction<{ wireId: string; multiselect: boolean }>) => {
			if (!payload.multiselect) {
				state.selectedWires = [payload.wireId]
				return
			}

			if (state.selectedWires.includes(payload.wireId)) {
				return
			}
			state.selectedWires = [...state.selectedWires, payload.wireId]
		},
		setWireSelection: (state, { payload }: PayloadAction<string[]>) => {
			if (
				state.selectedWires.length === payload.length &&
				state.selectedWires.every((wireId, index) => wireId === payload[index])
			) {
				return
			}
			state.selectedWires = [...new Set(payload)]
		},
		removeWireFromSelection: (state, { payload }: PayloadAction<string>) => {
			state.selectedWires = state.selectedWires.filter((wireId) => wireId !== payload)
		},
		clearSelections: (state) => {
			state.selectedNodes = []
			state.selectedWires = []
		},

		addNodeToHover: (state, { payload }: PayloadAction<{ key: string; entityId: string }>) => {
			state.hoveredNodes = state.hoveredNodes.filter((node) => node.key !== payload.key)
			state.hoveredNodes = [...state.hoveredNodes, payload]
		},
		removeNodeFromHover: (state, { payload }: PayloadAction<string>) => {
			state.hoveredNodes = state.hoveredNodes.filter((node) => node.key !== payload)
		},
		addWireToHover: (state, { payload }: PayloadAction<string>) => {
			state.hoveredWires = state.hoveredWires.filter((wireId) => wireId !== payload)
			state.hoveredWires = [...state.hoveredWires, payload]
		},
		removeWireFromHover: (state, { payload }: PayloadAction<string>) => {
			state.hoveredWires = state.hoveredWires.filter((wireId) => wireId !== payload)
		},
	},
})

export type MindmapState = typeof initialState
export const mindmapInitialState = initialState
export const MindmapReducer = mindmapSlice.reducer
