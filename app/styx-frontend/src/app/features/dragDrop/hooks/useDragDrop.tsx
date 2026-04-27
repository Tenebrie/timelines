import { ReactNode, useCallback, useEffect, useRef, useState } from 'react'

import { Shortcut, useShortcut } from '@/app/hooks/useShortcut/useShortcut'

import { getTransformAlign, GhostWrapper } from '../components/GhostWrapper'
import { AllowedDraggableType, DraggableParams } from '../types'
import { useDragDropState } from './useDragDropState'

type Props<T extends AllowedDraggableType> = {
	type: T
	params: DraggableParams[T]
	ghostAlign?: {
		top?: 'start' | 'center' | 'end'
		left?: 'start' | 'center' | 'end'
	}
	ghostFactory: (event: MouseEvent) => ReactNode
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
	const [ghostElement, setGhostElement] = useState<ReactNode | null>(null)
	const containerRef = useRef<HTMLDivElement | null>(null)
	const ghostWrapperRef = useRef<HTMLDivElement | null>(null)

	// Store props in refs to keep callbacks stable across renders
	const paramsRef = useRef(params)
	paramsRef.current = params
	const ghostFactoryRef = useRef(ghostFactory)
	ghostFactoryRef.current = ghostFactory
	const adjustPositionRef = useRef(adjustPosition)
	adjustPositionRef.current = adjustPosition
	const ghostAlignRef = useRef(ghostAlign)
	ghostAlignRef.current = ghostAlign

	const { getState, setStateQuietly, setStateImmediately, clearState } = useDragDropState()

	const onMouseDown = useCallback((event: MouseEvent) => {
		if (!containerRef.current || event.shiftKey) {
			return
		}
		// Only handle left-click (button 0) for dragging
		if (event.button !== 0) {
			return
		}
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
				params: paramsRef.current,
				targetPos: { x: event.clientX, y: event.clientY },
				targetRootPos: { x: rootPos.current.x, y: rootPos.current.y },
				isHandled: false,
			})
			window.document.body.classList.add('cursor-grabbing', 'mouse-busy')

			const align = {
				top: ghostAlignRef.current?.top ?? ('start' as const),
				left: ghostAlignRef.current?.left ?? ('start' as const),
			}
			setGhostElement(
				<GhostWrapper
					ref={ghostWrapperRef}
					initialLeft={rootPos.current.x}
					initialTop={rootPos.current.y}
					left={event.clientX}
					top={event.clientY}
					align={align}
				>
					{ghostFactoryRef.current(event)}
				</GhostWrapper>,
			)
		},
		[setStateImmediately, type],
	)

	const onMouseMove = useCallback(
		(event: MouseEvent) => {
			if (
				isPreparingToDrag.current &&
				(Math.abs(event.clientX - dragFromPos.current.x) > 3 ||
					Math.abs(event.clientY - dragFromPos.current.y) > 3)
			) {
				isPreparingToDrag.current = false
				startDragging(event)
			}
			if (!isDraggingNow.current) {
				return
			}

			const basePos = { x: event.clientX, y: event.clientY }
			const pos = adjustPositionRef.current ? adjustPositionRef.current(basePos, rootPos.current) : basePos
			setStateQuietly({
				...getState()!,
				targetPos: pos,
			})

			if (ghostWrapperRef.current) {
				const alignLeft = ghostAlignRef.current?.left ?? 'start'
				const alignTop = ghostAlignRef.current?.top ?? 'start'
				ghostWrapperRef.current.style.transform = `translate(${Math.round(pos.x)}px, ${Math.round(pos.y)}px) translate(${getTransformAlign(alignLeft)}, ${getTransformAlign(alignTop)})`
			}
		},
		[getState, setStateQuietly, startDragging],
	)

	const onMouseUp = useCallback(() => {
		isPreparingToDrag.current = false
		if (!isDraggingNow.current) {
			return
		}
		isDraggingNow.current = false
		setGhostElement(null)
		clearState()
		setTimeout(() => {
			window.document.body.classList.remove('cursor-grabbing', 'mouse-busy')
		}, 1)
	}, [clearState])

	const onRightClick = useCallback(
		(event: MouseEvent) => {
			if (!isDraggingNow.current) {
				return
			}
			onMouseUp()
			event.preventDefault()
		},
		[onMouseUp],
	)

	useShortcut(
		Shortcut.Escape,
		() => {
			onMouseUp()
		},
		!!ghostElement,
	)

	const attachEvents = useCallback(() => {
		const container = containerRef.current
		if (!container || disabled) {
			return
		}

		container.addEventListener('mousedown', onMouseDown)

		return () => {
			container.removeEventListener('mousedown', onMouseDown)
		}
	}, [onMouseDown, disabled])

	useEffect(() => {
		return attachEvents()
	}, [attachEvents])

	useEffect(() => {
		if (disabled) {
			return
		}
		window.addEventListener('contextmenu', onRightClick)
		window.addEventListener('mouseup', onMouseUp)
		window.addEventListener('mousemove', onMouseMove)
		window.addEventListener('blur', onMouseUp)

		return () => {
			window.removeEventListener('contextmenu', onRightClick)
			window.removeEventListener('mouseup', onMouseUp)
			window.removeEventListener('mousemove', onMouseMove)
			window.removeEventListener('blur', onMouseUp)
		}
	}, [onMouseMove, onMouseUp, onRightClick, disabled])

	return {
		ref: containerRef,
		isDragging: isDraggingNow.current,
		ghostElement,
		attachEvents,
	}
}
