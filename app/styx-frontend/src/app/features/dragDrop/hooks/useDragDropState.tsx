import { useCallback } from 'react'

import { DragDropState, DragDropStateType } from '../DragDropState'
import { AllowedDraggableType } from '../types'
import { useDragDropBusDispatch } from './useDragDropBus'

export const useDragDropState = () => {
	const notifyBus = useDragDropBusDispatch()

	const getState = useCallback(() => DragDropState.current, [])

	const setState = useCallback(
		(state: DragDropStateType<AllowedDraggableType>) => {
			setTimeout(() => {
				DragDropState.current = state
				notifyBus(state)
			}, 1)
		},
		[notifyBus],
	)

	const setStateQuietly = useCallback((state: DragDropStateType<AllowedDraggableType>) => {
		setTimeout(() => {
			DragDropState.current = state
		}, 1)
	}, [])

	const setStateImmediately = useCallback(
		(state: DragDropStateType<AllowedDraggableType>) => {
			DragDropState.current = state
			notifyBus(state)
		},
		[notifyBus],
	)

	const clearState = useCallback(() => {
		setTimeout(() => {
			DragDropState.current = null
			notifyBus(null)
		}, 1)
	}, [notifyBus])

	return { getState, setState, setStateQuietly, setStateImmediately, clearState }
}
