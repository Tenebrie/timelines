import Box from '@mui/material/Box'
import { RefObject, useEffect, useRef } from 'react'

type Props = {
	ref: RefObject<HTMLDivElement | null>
	onClick: () => void
	onUpdateSelection: (rect: SelectionRect) => void
	onFinalizeSelection: (rect: SelectionRect) => void
}

export type SelectionRect = {
	visible: boolean
	x: number
	y: number
	width: number
	height: number
}

export function SelectionBox({ ref, onClick, onUpdateSelection, onFinalizeSelection }: Props) {
	const selectionRect = useRef<SelectionRect>({
		visible: false,
		x: 0,
		y: 0,
		width: 0,
		height: 0,
	})
	const selectionBoxRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		const element = ref.current
		const selectionBoxElement = selectionBoxRef.current
		if (!element || !selectionBoxElement) {
			return
		}

		const applySelectionBoxStyle = () => {
			const { visible, x, y, width, height } = selectionRect.current
			const actualX = width < 0 ? x + width : x
			const actualY = height < 0 ? y + height : y
			selectionBoxElement.style.left = `${actualX}px`
			selectionBoxElement.style.top = `${actualY}px`
			selectionBoxElement.style.width = `${Math.abs(width)}px`
			selectionBoxElement.style.height = `${Math.abs(height)}px`
			selectionBoxElement.style.opacity = visible ? '1' : '0'
			selectionBoxElement.style.transition = visible ? 'none' : 'opacity 0.4s'
		}

		const mouseState = {
			isButtonDown: false,
			buttonDownMode: 'select' as 'select' | 'pan',

			canClick: true,
			deltaX: 0,
			deltaY: 0,
			lastIntersectionCheckTimestamp: 0,
		}

		const handleMouseDown = (event: MouseEvent) => {
			if (event.button === 0) {
				mouseState.isButtonDown = true
				mouseState.buttonDownMode = 'select'
				event.preventDefault()
			} else if (event.button === 2) {
				mouseState.isButtonDown = true
				mouseState.buttonDownMode = 'pan'
				event.preventDefault()
			}
			event.preventDefault()
		}

		const handleMouseUp = (event: MouseEvent) => {
			if ((event.button !== 0 && event.button !== 2) || !mouseState.isButtonDown) {
				return
			}
			if (mouseState.canClick) {
				onClick()
			}

			// Finalize selection on mouse up
			if (mouseState.buttonDownMode === 'select' && selectionRect.current.visible) {
				onFinalizeSelection(selectionRect.current)
			}

			selectionRect.current.visible = false
			applySelectionBoxStyle()
			mouseState.isButtonDown = false
			mouseState.canClick = true
			mouseState.deltaX = 0
			mouseState.deltaY = 0
		}

		const handleMouseMove = (event: MouseEvent) => {
			if (!mouseState.isButtonDown) {
				return
			}

			mouseState.deltaX += event.movementX
			mouseState.deltaY += event.movementY

			if (mouseState.canClick && (Math.abs(mouseState.deltaX) > 3 || Math.abs(mouseState.deltaY) > 3)) {
				mouseState.canClick = false
				if (mouseState.buttonDownMode === 'select') {
					const baseRect = element.getBoundingClientRect()
					const x = event.clientX - mouseState.deltaX - baseRect.left - 1
					const y = event.clientY - mouseState.deltaY - baseRect.top - 3
					selectionRect.current = {
						visible: true,
						x,
						y,
						width: mouseState.deltaX - 1,
						height: mouseState.deltaY,
					}
					applySelectionBoxStyle()
				}
				mouseState.deltaX = 0
				mouseState.deltaY = 0
			} else if (!mouseState.canClick && mouseState.buttonDownMode === 'select') {
				selectionRect.current.width += event.movementX
				selectionRect.current.height += event.movementY
				applySelectionBoxStyle()

				// Throttle intersection checks
				const now = Date.now()
				if (now - mouseState.lastIntersectionCheckTimestamp >= 16) {
					mouseState.lastIntersectionCheckTimestamp = now
					onUpdateSelection(selectionRect.current)
				}
			}
		}

		element.addEventListener('mousedown', handleMouseDown)
		window.addEventListener('mousemove', handleMouseMove)
		window.addEventListener('mouseup', handleMouseUp)

		return () => {
			element.removeEventListener('mousedown', handleMouseDown)
			window.removeEventListener('mousemove', handleMouseMove)
			window.removeEventListener('mouseup', handleMouseUp)
		}
	}, [onClick, onUpdateSelection, onFinalizeSelection, ref])

	return (
		<Box
			ref={selectionBoxRef}
			sx={{
				zIndex: 1000,
				backgroundColor: '#fff3',
				position: 'absolute',
				top: 0,
				left: 0,
				width: 0,
				height: 0,
				opacity: 0,
				pointerEvents: 'none',
			}}
		/>
	)
}
