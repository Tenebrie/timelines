import Box from '@mui/material/Box'
import { useRef, useState } from 'react'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import useEvent from 'react-use-event-hook'

import { useAutoRef } from '@/app/hooks/useAutoRef'
import { worldSlice } from '@/app/views/world/WorldSlice'
import { useStableNavigate } from '@/router-utils/hooks/useStableNavigate'

import { useNewNodeReceiver } from '../hooks/useNewNodeReceiver'

export function MindmapClickArea() {
	const navigate = useStableNavigate({ from: '/world/$worldId/mindmap' })
	const dispatch = useDispatch()

	const onClick = useEvent(() => {
		navigate({ search: (prev) => ({ ...prev, navi: [], new: undefined }) })
		dispatch(worldSlice.actions.clearSelections())
	})

	const ref = useRef<HTMLDivElement>(null)
	useNewNodeReceiver({ ref })

	const [selectionRect, setSelectionRect] = useState<{
		visible: boolean
		x: number
		y: number
		width: number
		height: number
	}>({
		visible: false,
		x: 0,
		y: 0,
		width: 0,
		height: 0,
	})
	const selectionRectRef = useAutoRef(selectionRect)

	useEffect(() => {
		const element = ref.current
		if (!element) {
			return
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
			if (mouseState.buttonDownMode === 'select' && selectionRectRef.current.visible) {
				const selectedNodes = checkNodeIntersection(ref.current, selectionRectRef.current)
				dispatch(worldSlice.actions.setActorNodeSelection(selectedNodes))
			}

			setSelectionRect((prev) => ({
				...prev,
				visible: false,
			}))
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

			if (mouseState.canClick && (Math.abs(mouseState.deltaX) > 5 || Math.abs(mouseState.deltaY) > 5)) {
				mouseState.canClick = false
				if (mouseState.buttonDownMode === 'select') {
					const baseRect = element.getBoundingClientRect()
					const x = event.clientX - mouseState.deltaX - baseRect.left - 1
					const y = event.clientY - mouseState.deltaY - baseRect.top - 3
					setSelectionRect({
						visible: true,
						x,
						y,
						width: mouseState.deltaX - 1,
						height: mouseState.deltaY,
					})
				}
				mouseState.deltaX = 0
				mouseState.deltaY = 0
			} else if (!mouseState.canClick && mouseState.buttonDownMode === 'select') {
				setSelectionRect((prev) => {
					const newRect = {
						...prev,
						width: prev.width + event.movementX,
						height: prev.height + event.movementY,
					}

					// Throttle intersection checks to reduce rerenders
					const now = Date.now()
					if (now - mouseState.lastIntersectionCheckTimestamp >= 100) {
						mouseState.lastIntersectionCheckTimestamp = now
						const selectedNodes = checkNodeIntersection(ref.current, newRect)
						dispatch(worldSlice.actions.setActorNodeSelection(selectedNodes))
					}

					return newRect
				})
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
	}, [onClick, selectionRectRef, dispatch])

	return (
		<>
			<Box ref={ref} sx={{ position: 'absolute', width: '100%', height: '100%', top: 0, left: 0 }}></Box>
			<MindmapSelectionBox {...selectionRect} />
		</>
	)
}

type SelectionBoxProps = {
	visible: boolean
	x: number
	y: number
	width: number
	height: number
}

function MindmapSelectionBox({ visible, x, y, width, height }: SelectionBoxProps) {
	const actualX = width < 0 ? x + width : x
	const actualY = height < 0 ? y + height : y
	const actualWidth = Math.abs(width)
	const actualHeight = Math.abs(height)

	return (
		<Box
			sx={{
				zIndex: 1000,
				backgroundColor: '#fff3',
				position: 'absolute',
				top: `${actualY}px`,
				left: `${actualX}px`,
				width: `${actualWidth}px`,
				height: `${actualHeight}px`,
				opacity: visible ? 1 : 0,
				pointerEvents: 'none',
				transition: visible ? 'none' : 'opacity 0.4s',
			}}
		/>
	)
}

function checkNodeIntersection(
	parentElement: HTMLElement | null,
	selectionBox: { x: number; y: number; width: number; height: number },
) {
	if (!parentElement) {
		return []
	}
	const nodes = document.querySelectorAll('[data-mindmap-node]')
	const selectedNodeIds = new Set<string>()

	// Normalize selection box coordinates (handle negative width/height)
	const boxLeft = selectionBox.width < 0 ? selectionBox.x + selectionBox.width : selectionBox.x
	const boxTop = selectionBox.height < 0 ? selectionBox.y + selectionBox.height : selectionBox.y
	const boxRight = boxLeft + Math.abs(selectionBox.width)
	const boxBottom = boxTop + Math.abs(selectionBox.height)

	nodes.forEach((nodeElement) => {
		const rect = nodeElement.getBoundingClientRect()
		const containerRect = parentElement.getBoundingClientRect()

		// Convert node position to container-relative coordinates
		const nodeLeft = rect.left - containerRect.left
		const nodeTop = rect.top - containerRect.top
		const nodeRight = nodeLeft + rect.width
		const nodeBottom = nodeTop + rect.height

		// Check if boxes intersect
		const intersects =
			boxLeft < nodeRight && boxRight > nodeLeft && boxTop < nodeBottom && boxBottom > nodeTop

		if (intersects) {
			const nodeId = nodeElement.getAttribute('data-mindmap-node')
			const actorId = nodeElement.getAttribute('data-actor-id')
			if (nodeId && actorId) {
				selectedNodeIds.add(JSON.stringify({ key: nodeId, actorId }))
			}
		}
	})

	return Array.from(selectedNodeIds).map((str) => JSON.parse(str) as { key: string; actorId: string })
}
