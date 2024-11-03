import { useState } from 'react'

import { AllowedDraggableType, DraggableParams } from './types'
import { useDragDropBusDispatch, useDragDropBusSubscribe } from './useDragDropBus'

export const DragDropState = {
	current: null as DragDropStateType<AllowedDraggableType> | null,
}

export type DragDropStateType<T extends AllowedDraggableType> = {
	type: T
	params: DraggableParams[T]
}

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
		clearState: () => {
			setTimeout(() => {
				DragDropState.current = null
				notifyBus()
			}, 1)
		},
	}
}

export const useDragDropStateWithRenders = () => {
	const [state, setState] = useState(DragDropState.current)
	useDragDropBusSubscribe({
		callback: () => setState(DragDropState.current),
	})

	return {
		state,
		isDragging: !!state,
		setState: (state: DragDropStateType<AllowedDraggableType>) => {
			setTimeout(() => {
				DragDropState.current = state
			}, 1)
		},
		clearState: () => {
			setTimeout(() => {
				DragDropState.current = null
			}, 1)
		},
	}
}
