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

		const onMouseEnter = () => {
			const state = getState()
			if (state === null || state.type !== type || state.isHandled) {
				return
			}
			setStateImmediately({
				...state,
				hovered: [...state.hovered, container],
			})
		}

		const onMouseLeave = () => {
			const state = getState()
			if (state === null || state.type !== type || state.isHandled) {
				return
			}
			setStateImmediately({
				...state,
				hovered: state.hovered.filter((el) => el !== container),
			})
		}

		container.addEventListener('mouseenter', onMouseEnter)
		container.addEventListener('mouseleave', onMouseLeave)
		container.addEventListener('mouseup', onDropCallback)

		return () => {
			container.removeEventListener('mouseenter', onMouseEnter)
			container.removeEventListener('mouseleave', onMouseLeave)
			container.removeEventListener('mouseup', onDropCallback)
		}
	}, [containerRef, receiverRef, onDropCallback, getState, type, setStateImmediately])

	return {
		ref: containerRef,
		getState,
	}
}
