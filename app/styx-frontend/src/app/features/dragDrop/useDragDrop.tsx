import { ReactNode, useCallback, useEffect, useRef, useState } from 'react'

import { useEffectOnce } from '../../utils/useEffectOnce'
import { useDragDropState } from './DragDropState'
import { GhostWrapper } from './GhostWrapper'
import { AllowedDraggableType, DraggableParams } from './types'

type Props<T extends AllowedDraggableType> = {
	type: T
	params: DraggableParams[T]
	ghostFactory: () => ReactNode
}

export const useDragDrop = <T extends AllowedDraggableType>({ type, params, ghostFactory }: Props<T>) => {
	const isDraggingNow = useRef(false)
	const isPreparingToDrag = useRef(false)
	const rootPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
	const dragFromPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
	const [ghostElement, setGhostElement] = useState<ReturnType<typeof GhostWrapper> | null>(null)
	const containerRef = useRef<HTMLDivElement | null>(null)

	const { setState, clearState } = useDragDropState()

	const onMouseDown = useCallback((event: MouseEvent) => {
		if (!containerRef.current) {
			return
		}
		window.document.body.classList.add('cursor-grabbing', 'mouse-busy')
		isPreparingToDrag.current = true
		const boundingRect = containerRef.current.getBoundingClientRect()
		rootPos.current = { x: boundingRect.left, y: boundingRect.top }
		dragFromPos.current = { x: event.clientX, y: event.clientY }
	}, [])

	const startDragging = useCallback(
		(event: MouseEvent) => {
			if (!containerRef.current) {
				return
			}
			isDraggingNow.current = true
			setState({ type, params })

			setGhostElement(
				<GhostWrapper
					initialLeft={rootPos.current.x}
					initialTop={rootPos.current.y}
					left={event.clientX}
					top={event.clientY}
				>
					{ghostFactory()}
				</GhostWrapper>,
			)
		},
		[ghostFactory, params, setState, type],
	)

	const onMouseMove = useCallback(
		(event: MouseEvent) => {
			if (
				isPreparingToDrag.current &&
				(Math.abs(event.clientX - dragFromPos.current.x) > 5 ||
					Math.abs(event.clientY - dragFromPos.current.y) > 5)
			) {
				isPreparingToDrag.current = false
				startDragging(event)
			}

			if (isDraggingNow.current) {
				setGhostElement(
					<GhostWrapper
						initialLeft={rootPos.current.x}
						initialTop={rootPos.current.y}
						left={event.clientX}
						top={event.clientY}
					>
						{ghostFactory()}
					</GhostWrapper>,
				)
			}
		},
		[ghostFactory, startDragging],
	)

	const onMouseUp = useCallback(() => {
		isDraggingNow.current = false
		isPreparingToDrag.current = false
		setGhostElement(null)
		clearState()
		window.document.body.classList.remove('cursor-grabbing', 'mouse-busy')
	}, [clearState])

	const attachEvents = useCallback(() => {
		const container = containerRef.current
		if (!container) {
			return
		}

		container.addEventListener('mousedown', onMouseDown)

		return () => {
			container.removeEventListener('mousedown', onMouseDown)
		}
	}, [containerRef, onMouseDown])

	useEffect(() => {
		attachEvents()
	}, [attachEvents])

	useEffectOnce(() => {
		window.addEventListener('mouseup', onMouseUp)
		window.addEventListener('mousemove', onMouseMove)

		return () => {
			window.removeEventListener('mouseup', onMouseUp)
			window.removeEventListener('mousemove', onMouseUp)
		}
	})

	return {
		ref: containerRef,
		isDragging: isDraggingNow.current,
		ghostElement,
		attachEvents,
	}
}
