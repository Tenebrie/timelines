import { ReactNode, useCallback, useEffect, useRef, useState } from 'react'

import { useEffectOnce } from '../app/utils/useEffectOnce'

type Props = {
	ghostFactory: () => ReactNode
}

type WrapperProps = {
	children: ReactNode
	initialLeft: number
	initialTop: number
	left: number
	top: number
}

const GhostWrapper = ({ children, initialLeft, initialTop, left, top }: WrapperProps) => {
	return (
		<div
			style={{
				position: 'absolute',
				transform: `translate(${left - initialLeft}px, ${top - initialTop}px)`,
				top: 'calc(-50% + 5px)',
				left: 'calc(-50% + 5px)',
				cursor: 'grabbing',
			}}
		>
			{children}
		</div>
	)
}

export const useDragDrop = <T extends HTMLElement>({ ghostFactory }: Props) => {
	const isDraggingNow = useRef(false)
	const isPreparingToDrag = useRef(false)
	const rootPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
	const dragFromPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
	const [ghostElement, setGhostElement] = useState<ReturnType<typeof GhostWrapper> | null>(null)
	const containerRef = useRef<T | null>(null)

	const onMouseDown = useCallback((event: MouseEvent) => {
		if (!containerRef.current) {
			return
		}
		window.document.body.classList.add('resizing')
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
		[ghostFactory],
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

	const onMouseUp = useCallback((event: MouseEvent) => {
		isDraggingNow.current = false
		isPreparingToDrag.current = false
		setGhostElement(null)
		window.document.body.classList.remove('resizing')
	}, [])

	useEffect(() => {
		const container = containerRef.current
		if (!container) {
			return
		}

		container.addEventListener('mousedown', onMouseDown)

		return () => {
			container.removeEventListener('mousedown', onMouseDown)
		}
	}, [containerRef, onMouseDown])

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
	}
}
