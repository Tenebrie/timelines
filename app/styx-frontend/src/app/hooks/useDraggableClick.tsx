import { useCallback, useRef } from 'react'

import { useMousePositionRef } from '@/app/hooks/useMousePositionRef'

type Props = {
	onClick?: (event: MouseEvent | React.MouseEvent) => void
	onRightClick?: (event: MouseEvent | React.MouseEvent) => void
}

export function useDraggableClick({ onClick, onRightClick }: Props) {
	const mousePos = useMousePositionRef()
	const clickStartedFrom = useRef<{ x: number; y: number } | null>(null)

	const onMouseDown = useCallback(() => {
		clickStartedFrom.current = { x: mousePos.current.x, y: mousePos.current.y }
	}, [mousePos])

	const onMouseUp = useCallback(
		(event: MouseEvent | React.MouseEvent) => {
			if (!clickStartedFrom.current) {
				return
			}

			const deltaX = mousePos.current.x - clickStartedFrom.current.x
			const deltaY = mousePos.current.y - clickStartedFrom.current.y

			if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
				// Dragging occurred
			} else {
				// Click occurred
				if (event.button === 0) {
					onClick?.(event)
				} else if (event.button === 2) {
					onRightClick?.(event)
				}
			}

			clickStartedFrom.current = null
		},
		[mousePos, onClick, onRightClick],
	)

	return {
		onMouseDown,
		onMouseUp,
	}
}
