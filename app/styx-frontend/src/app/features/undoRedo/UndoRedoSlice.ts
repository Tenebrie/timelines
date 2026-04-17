import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export const initialState = {
	undoStack: [] as { onUndo: () => void; onRedo: () => void }[],
	redoStack: [] as { onUndo: () => void; onRedo: () => void }[],
}

export const undoRedoSlice = createSlice({
	name: 'undoRedo',
	initialState,
	reducers: {
		registerAction: (state, { payload }: PayloadAction<{ onUndo: () => void; onRedo: () => void }>) => {
			state.undoStack.push(payload)
			state.redoStack = []
		},
		undo: (state) => {
			const action = state.undoStack.pop()
			if (action) {
				action.onUndo()
				state.redoStack.push(action)
			}
		},
		redo: (state) => {
			const action = state.redoStack.pop()
			if (action) {
				action.onRedo()
				state.undoStack.push(action)
			}
		},
		clearHistory: (state) => {
			state.undoStack = []
			state.redoStack = []
		},
	},
})

export type UndoRedoState = typeof initialState
export const undoRedoInitialState = initialState
export const UndoRedoReducer = undoRedoSlice.reducer
