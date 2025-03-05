import { useState } from 'react'

import { DragDropState, DragDropStateType } from '../DragDropState'
import { AllowedDraggableType } from '../types'
import { useDragDropBusDispatch, useDragDropBusSubscribe } from './useDragDropBus'

export const useDragDropStateWithRenders = () => {
	const [state, setState] = useState(DragDropState.current)
	useDragDropBusSubscribe({
		callback: () => setState(DragDropState.current),
	})
	const notifyBus = useDragDropBusDispatch()

	return {
		state,
		isDragging: !!state,
		setState: (state: DragDropStateType<AllowedDraggableType>) => {
			setTimeout(() => {
				DragDropState.current = state
				notifyBus()
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
