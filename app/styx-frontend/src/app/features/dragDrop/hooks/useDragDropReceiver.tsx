import { RefObject, useCallback, useEffect, useRef } from 'react'

import { DragDropStateType } from '../DragDropState'
import { AllowedDraggableType } from '../types'
import { useDragDropState } from './useDragDropState'

type Props<T extends AllowedDraggableType> = {
	type: T
	receiverRef?: RefObject<HTMLDivElement | null>
	onDrop: (state: DragDropStateType<T>, event: MyEvent) => void
}

type MyEvent = {
	markHandled: () => void
}

export const useDragDropReceiver = <T extends AllowedDraggableType>({
	type,
	receiverRef,
	onDrop,
}: Props<T>) => {
	const containerRef = useRef<HTMLDivElement | null>(null)
	const { getState, setStateImmediately } = useDragDropState()

	const onDropCallback = useCallback(() => {
		const state = getState()
		if (state !== null && state.type === type && !state.isHandled) {
			onDrop(state as DragDropStateType<T>, {
				markHandled: () => {
					setStateImmediately({
						...state,
						isHandled: true,
					})
				},
			})
		}
	}, [getState, type, onDrop, setStateImmediately])

	useEffect(() => {
		const container = receiverRef?.current ?? containerRef.current
		if (!container) {
			return
		}

		container.addEventListener('mouseup', onDropCallback)

		return () => {
			container.removeEventListener('mouseup', onDropCallback)
		}
	}, [containerRef, receiverRef, onDropCallback])

	return {
		ref: containerRef,
		getState,
	}
}
