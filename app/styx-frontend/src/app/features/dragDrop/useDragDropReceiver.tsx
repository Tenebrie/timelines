import { useCallback, useEffect, useRef } from 'react'

import { DragDropStateType, useDragDropState } from './DragDropState'
import { AllowedDraggableType } from './types'

type Props<T extends AllowedDraggableType> = {
	type: T
	onDrop: (state: DragDropStateType<T>) => void
}

export const useDragDropReceiver = <T extends AllowedDraggableType>({ type, onDrop }: Props<T>) => {
	const containerRef = useRef<HTMLDivElement | null>(null)
	const { getState } = useDragDropState()

	const onDropCallback = useCallback(() => {
		const state = getState()
		if (state !== null && state.type === type) {
			onDrop(state as DragDropStateType<T>)
		}
	}, [getState, type, onDrop])

	useEffect(() => {
		const container = containerRef.current
		if (!container) {
			return
		}

		container.addEventListener('mouseup', onDropCallback)

		return () => {
			container.removeEventListener('mouseup', onDropCallback)
		}
	}, [containerRef, onDropCallback])

	return {
		ref: containerRef,
		getState,
	}
}
