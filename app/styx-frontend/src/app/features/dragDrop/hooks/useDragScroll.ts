import { RefObject, useCallback, useRef } from 'react'

import { IsDragDropStateOfType } from '../DragDropState'
import { AllowedDraggableType } from '../types'
import { useDragDropBusSubscribe } from './useDragDropBus'

type Props<T extends AllowedDraggableType> = {
	type: T
	scrollRef: RefObject<HTMLElement | null>
	enabled?: boolean
}

const EDGE_SIZE = 72
const MIN_SPEED = 0
const MAX_SPEED = 1200

/**
 * While a drag of the given type is in progress, scrolls the referenced container up or down when the
 * pointer hovers close to its top or bottom edge. The closer the pointer is to the edge, the faster it scrolls.
 */
export function useDragScroll<T extends AllowedDraggableType>({ type, scrollRef, enabled = true }: Props<T>) {
	const pointerYRef = useRef(0)
	const frameRef = useRef<number | null>(null)
	const lastTimestampRef = useRef<number | null>(null)

	const stop = useCallback(() => {
		if (frameRef.current !== null) {
			cancelAnimationFrame(frameRef.current)
			frameRef.current = null
		}
		lastTimestampRef.current = null
	}, [])

	const onMouseMove = useCallback((event: MouseEvent) => {
		pointerYRef.current = event.clientY
	}, [])

	const tick = useCallback(
		(timestamp: number) => {
			frameRef.current = requestAnimationFrame(tick)

			const deltaSeconds =
				lastTimestampRef.current === null ? 0 : (timestamp - lastTimestampRef.current) / 1000
			lastTimestampRef.current = timestamp

			const container = scrollRef.current
			if (!container || deltaSeconds === 0) {
				return
			}

			const rect = container.getBoundingClientRect()
			const fromTop = pointerYRef.current - rect.top
			const fromBottom = rect.bottom - pointerYRef.current

			let speed = 0
			if (fromTop < EDGE_SIZE) {
				const intensity = 1 - Math.max(fromTop, 0) / EDGE_SIZE
				speed = -(MIN_SPEED + (MAX_SPEED - MIN_SPEED) * intensity)
			} else if (fromBottom < EDGE_SIZE) {
				const intensity = 1 - Math.max(fromBottom, 0) / EDGE_SIZE
				speed = MIN_SPEED + (MAX_SPEED - MIN_SPEED) * intensity
			}

			if (speed !== 0) {
				container.scrollTop += speed * deltaSeconds
			}
		},
		[scrollRef],
	)

	useDragDropBusSubscribe({
		callback: useCallback(
			(state) => {
				if (enabled && IsDragDropStateOfType(state, type)) {
					if (frameRef.current === null) {
						pointerYRef.current = state.targetPos.y
						window.addEventListener('mousemove', onMouseMove)
						frameRef.current = requestAnimationFrame(tick)
					}
				} else {
					window.removeEventListener('mousemove', onMouseMove)
					stop()
				}
			},
			[enabled, type, onMouseMove, tick, stop],
		),
		onCleanup: useCallback(() => {
			window.removeEventListener('mousemove', onMouseMove)
			stop()
		}, [onMouseMove, stop]),
	})
}
