import { RefObject, useCallback, useEffect, useRef } from 'react'

import { DragDropState, IsDragDropStateOfType } from '../DragDropState'
import { AllowedDraggableType } from '../types'
import { useDragDropBusSubscribe } from './useDragDropBus'

type Props<T extends AllowedDraggableType> = {
	type: T
	targetRef: RefObject<HTMLElement | null>
	onTrigger: () => void
	enabled?: boolean
	delay?: number
}

/**
 * Invokes the callback once the pointer has dwelled over the target element for `delay` milliseconds
 * while a drag of the given type is in progress. Used to expand collapsed drop targets on hover.
 */
export function useDragHoverExpand<T extends AllowedDraggableType>({
	type,
	targetRef,
	onTrigger,
	enabled = true,
	delay = 700,
}: Props<T>) {
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

	const onTriggerRef = useRef(onTrigger)
	onTriggerRef.current = onTrigger

	const cancel = useCallback(() => {
		if (timeoutRef.current !== null) {
			clearTimeout(timeoutRef.current)
			timeoutRef.current = null
		}
	}, [])

	const onMouseEnter = useCallback(() => {
		if (timeoutRef.current !== null || !IsDragDropStateOfType(DragDropState.current, type)) {
			return
		}
		timeoutRef.current = setTimeout(() => {
			timeoutRef.current = null
			onTriggerRef.current()
		}, delay)
	}, [type, delay])

	useEffect(() => {
		const element = targetRef.current
		if (!element || !enabled) {
			return
		}
		element.addEventListener('mouseenter', onMouseEnter)
		element.addEventListener('mouseleave', cancel)
		return () => {
			element.removeEventListener('mouseenter', onMouseEnter)
			element.removeEventListener('mouseleave', cancel)
			cancel()
		}
	}, [targetRef, enabled, onMouseEnter, cancel])

	// Abort a pending expand if the drag ends while the pointer is still hovering.
	useDragDropBusSubscribe({
		callback: useCallback(
			(state) => {
				if (!IsDragDropStateOfType(state, type)) {
					cancel()
				}
			},
			[type, cancel],
		),
	})
}
