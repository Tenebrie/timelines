import { ReactNode, useCallback, useEffect, useRef, useState } from 'react'

import { useDragDropState } from './DragDropState'
import { GhostWrapper } from './GhostWrapper'
import { AllowedDraggableType, DraggableParams } from './types'

type Props<T extends AllowedDraggableType> = {
	type: T
	params: DraggableParams[T]
	ghostAlign?: {
		top?: 'start' | 'center' | 'end'
		left?: 'start' | 'center' | 'end'
	}
	ghostFactory: () => ReactNode
	adjustPosition?: (
		pos: { x: number; y: number },
		startingPos: { x: number; y: number },
	) => { x: number; y: number }
	disabled?: boolean
}

export const useDragDrop = <T extends AllowedDraggableType>({
	type,
	params,
	ghostAlign,
	ghostFactory,
	adjustPosition,
	disabled,
}: Props<T>) => {
	const isDraggingNow = useRef(false)
	const isPreparingToDrag = useRef(false)
	const rootPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
	const dragFromPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
	const [ghostElement, setGhostElement] = useState<ReturnType<typeof GhostWrapper> | null>(null)
	const containerRef = useRef<HTMLDivElement | null>(null)

	const { getState, setStateQuietly, setStateImmediately, clearState } = useDragDropState()

	const onMouseDown = useCallback((event: MouseEvent) => {
		if (!containerRef.current) {
			return
		}
		window.document.body.classList.add('cursor-grabbing', 'mouse-busy')
		isPreparingToDrag.current = true
		const boundingRect = containerRef.current.getBoundingClientRect()
		rootPos.current = {
			x: boundingRect.left,
			y: boundingRect.top,
		}
		dragFromPos.current = { x: event.clientX, y: event.clientY }
	}, [])

	const startDragging = useCallback(
		(event: MouseEvent) => {
			if (!containerRef.current) {
				return
			}
			isDraggingNow.current = true
			setStateImmediately({
				type,
				params,
				targetPos: { x: event.clientX, y: event.clientY },
				targetRootPos: { x: rootPos.current.x, y: rootPos.current.y },
			})

			setGhostElement(
				<GhostWrapper
					initialLeft={rootPos.current.x}
					initialTop={rootPos.current.y}
					left={event.clientX}
					top={event.clientY}
					align={{
						top: ghostAlign?.top ?? 'start',
						left: ghostAlign?.left ?? 'start',
					}}
				>
					{ghostFactory()}
				</GhostWrapper>,
			)
		},
		[ghostFactory, params, setStateImmediately, type, ghostAlign],
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
				const basePos = { x: event.clientX, y: event.clientY }
				const pos = adjustPosition ? adjustPosition(basePos, rootPos.current) : basePos
				setStateQuietly({
					...getState()!,
					targetPos: pos,
				})
				// TODO: Do not recreate the ghost every frame
				setGhostElement(
					<GhostWrapper
						initialLeft={rootPos.current.x}
						initialTop={rootPos.current.y}
						left={pos.x}
						top={pos.y}
						align={{
							top: ghostAlign?.top ?? 'start',
							left: ghostAlign?.left ?? 'start',
						}}
					>
						{ghostFactory()}
					</GhostWrapper>,
				)
			}
		},
		[adjustPosition, getState, ghostFactory, setStateQuietly, startDragging, ghostAlign],
	)

	const onMouseUp = useCallback(() => {
		isDraggingNow.current = false
		isPreparingToDrag.current = false
		setGhostElement(null)
		clearState()
		setTimeout(() => {
			window.document.body.classList.remove('cursor-grabbing', 'mouse-busy')
		}, 1)
	}, [clearState])

	const attachEvents = useCallback(() => {
		const container = containerRef.current
		if (!container || disabled) {
			return
		}

		container.style.position = 'relative'
		container.addEventListener('mousedown', onMouseDown)

		return () => {
			container.removeEventListener('mousedown', onMouseDown)
		}
	}, [containerRef, onMouseDown, disabled])

	useEffect(() => {
		attachEvents()
	}, [attachEvents])

	useEffect(() => {
		if (disabled) {
			return
		}
		window.addEventListener('mouseup', onMouseUp)
		window.addEventListener('mousemove', onMouseMove)

		return () => {
			window.removeEventListener('mouseup', onMouseUp)
			window.removeEventListener('mousemove', onMouseMove)
		}
	}, [onMouseMove, onMouseUp, disabled])

	return {
		ref: containerRef,
		isDragging: isDraggingNow.current,
		ghostElement,
		attachEvents,
	}
}
