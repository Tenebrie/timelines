import { RefObject, useCallback, useEffect, useRef } from 'react'

import { DragDropStateType } from '../DragDropState'
import { AllowedDraggableType } from '../types'
import { useDragDropState } from './useDragDropState'

type Props<T extends AllowedDraggableType, R extends RefObject<unknown>> = {
	type: T
	receiverRef?: R
	onDrop: (state: DragDropStateType<T>, event: DragDropEvent) => void
}

type DragDropEvent = {
	markHandled: () => void
	mouseEvent?: MouseEvent
}

export const useDragDropReceiver = <T extends AllowedDraggableType, R extends RefObject<HTMLElement | null>>({
	type,
	receiverRef,
	onDrop,
}: Props<T, R>) => {
	const containerRef = useRef<HTMLDivElement | null>(null)
	const { getState, setStateImmediately } = useDragDropState()

	const onDropCallback = useCallback(
		(event: MouseEvent) => {
			const state = getState()
			if (state !== null && state.type === type && !state.isHandled) {
				onDrop(state as DragDropStateType<T>, {
					mouseEvent: event,
					markHandled: () => {
						setStateImmediately({
							...state,
							isHandled: true,
						})
					},
				})
			}
		},
		[getState, type, onDrop, setStateImmediately],
	)

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
