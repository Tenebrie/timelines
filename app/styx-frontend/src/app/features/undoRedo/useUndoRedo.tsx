import { useCallback } from 'react'
import { useDispatch } from 'react-redux'

import { undoRedoSlice } from './UndoRedoSlice'

export function useUndoRedo() {
	const { registerAction, clearHistory } = undoRedoSlice.actions
	const dispatch = useDispatch()

	const doRegisterAction = useCallback(
		(onUndo: () => void, onRedo: () => void) => {
			dispatch(registerAction({ onUndo, onRedo }))
		},
		[dispatch, registerAction],
	)

	const doClearHistory = useCallback(() => {
		dispatch(clearHistory())
	}, [dispatch, clearHistory])

	return { registerAction: doRegisterAction, clearHistory: doClearHistory }
}
