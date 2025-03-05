import { DragDropState, DragDropStateType } from '../DragDropState'
import { AllowedDraggableType } from '../types'
import { useDragDropBusDispatch } from './useDragDropBus'

export const useDragDropState = () => {
	const notifyBus = useDragDropBusDispatch()

	return {
		getState: () => DragDropState.current,
		setState: (state: DragDropStateType<AllowedDraggableType>) => {
			setTimeout(() => {
				DragDropState.current = state
				notifyBus()
			}, 1)
		},
		setStateQuietly: (state: DragDropStateType<AllowedDraggableType>) => {
			setTimeout(() => {
				DragDropState.current = state
			}, 1)
		},
		setStateImmediately: (state: DragDropStateType<AllowedDraggableType>) => {
			DragDropState.current = state
			notifyBus()
		},
		clearState: () => {
			setTimeout(() => {
				DragDropState.current = null
				notifyBus()
			}, 1)
		},
	}
}
