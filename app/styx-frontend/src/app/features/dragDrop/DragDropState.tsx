import { AllowedDraggableType, DraggableParams } from './types'

export const DragDropState = {
	current: null as DragDropStateType<AllowedDraggableType> | null,
}

export type DragDropStateType<T extends AllowedDraggableType> = {
	type: T
	params: DraggableParams[T]
	targetPos: { x: number; y: number }
	targetRootPos: { x: number; y: number }
	isHandled: boolean
}

export const IsDragDropStateOfType = <T extends AllowedDraggableType>(
	state: DragDropStateType<AllowedDraggableType> | null,
	type: T,
): state is DragDropStateType<T> => {
	return state?.type === type
}
