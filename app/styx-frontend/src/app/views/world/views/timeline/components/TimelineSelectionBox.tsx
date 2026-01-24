import Box from '@mui/material/Box'
import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import useEvent from 'react-use-event-hook'

import { useAutoRef } from '@/app/hooks/useAutoRef'
import { worldSlice } from '@/app/views/world/WorldSlice'
import { useStableNavigate } from '@/router-utils/hooks/useStableNavigate'

type Props = {
	containerRef: React.RefObject<HTMLDivElement | null>
}

export function TimelineSelectionBox({ containerRef }: Props) {
	const navigate = useStableNavigate({ from: '/world/$worldId/timeline' })
	const dispatch = useDispatch()

	const onClick = useEvent(() => {
		navigate({ search: (prev) => ({ ...prev, navi: [] }) })
		dispatch(worldSlice.actions.clearSelections())
	})

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
		const container = containerRef.current
		if (!container) {
			return
		}

		const mouseState = {
			isButtonDown: false,
			canClick: true,
			deltaX: 0,
			deltaY: 0,
			lastIntersectionCheckTimestamp: 0,
		}

		const handleMouseDown = (event: MouseEvent) => {
			// Only handle left-click (button 0) for selection
			if (event.button !== 0) {
				return
			}
			// Check if the click target is something we shouldn't interfere with
			const target = event.target as HTMLElement
			if (
				target.closest('[data-testid="TimelineMarker"]') ||
				target.closest('.MuiButton-root') ||
				target.closest('.MuiIconButton-root') ||
				target.closest('[role="button"]') ||
				window.document.body.classList.contains('mouse-busy')
			) {
				return
			}
			mouseState.isButtonDown = true
			event.preventDefault()
		}

		const handleMouseUp = (event: MouseEvent) => {
			if (event.button !== 0 || !mouseState.isButtonDown) {
				return
			}

			// Remove busy class
			setTimeout(() => {
				window.document.body.classList.remove('mouse-busy')
			}, 0)

			// Only handle selection box logic if we actually dragged (canClick is false)
			if (!mouseState.canClick) {
				// Finalize selection on mouse up
				if (selectionRectRef.current.visible) {
					const selectedMarkers = checkMarkerIntersection(container, selectionRectRef.current)
					dispatch(worldSlice.actions.setTimelineMarkerSelection(selectedMarkers))
				}
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

			if (mouseState.canClick && (Math.abs(mouseState.deltaX) > 3 || Math.abs(mouseState.deltaY) > 3)) {
				mouseState.canClick = false
				// Mark that we're busy to block timeline click handler and tooltips
				window.document.body.classList.add('mouse-busy')
				const baseRect = container.getBoundingClientRect()
				const x = event.clientX - mouseState.deltaX - baseRect.left
				const y = event.clientY - mouseState.deltaY - baseRect.top
				setSelectionRect({
					visible: true,
					x,
					y,
					width: mouseState.deltaX,
					height: mouseState.deltaY,
				})
				mouseState.deltaX = 0
				mouseState.deltaY = 0
			} else if (!mouseState.canClick) {
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
						const selectedMarkers = checkMarkerIntersection(container, newRect)
						requestIdleCallback(() => {
							dispatch(worldSlice.actions.setTimelineMarkerSelection(selectedMarkers))
						})
					}

					return newRect
				})
			}
		}

		container.addEventListener('mousedown', handleMouseDown)
		window.addEventListener('mousemove', handleMouseMove)
		window.addEventListener('mouseup', handleMouseUp)

		return () => {
			container.removeEventListener('mousedown', handleMouseDown)
			window.removeEventListener('mousemove', handleMouseMove)
			window.removeEventListener('mouseup', handleMouseUp)
		}
	}, [onClick, selectionRectRef, dispatch, containerRef])

	const actualX = selectionRect.width < 0 ? selectionRect.x + selectionRect.width : selectionRect.x
	const actualY = selectionRect.height < 0 ? selectionRect.y + selectionRect.height : selectionRect.y
	const actualWidth = Math.abs(selectionRect.width)
	const actualHeight = Math.abs(selectionRect.height)

	return (
		<Box
			sx={{
				zIndex: 1000,
				backgroundColor: '#fff3',
				border: '1px solid #fff8',
				position: 'absolute',
				top: `${actualY}px`,
				left: `${actualX}px`,
				width: `${actualWidth}px`,
				height: `${actualHeight}px`,
				opacity: selectionRect.visible ? 1 : 0,
				pointerEvents: 'none',
				transition: selectionRect.visible ? 'none' : 'opacity 0.4s',
			}}
		/>
	)
}

function checkMarkerIntersection(
	parentElement: HTMLElement | null,
	selectionBox: { x: number; y: number; width: number; height: number },
) {
	if (!parentElement) {
		return []
	}
	const markers = document.querySelectorAll('[data-testid="TimelineMarker"]')
	const selectedMarkerIds = new Set<string>()

	// Normalize selection box coordinates (handle negative width/height)
	const boxLeft = selectionBox.width < 0 ? selectionBox.x + selectionBox.width : selectionBox.x
	const boxTop = selectionBox.height < 0 ? selectionBox.y + selectionBox.height : selectionBox.y
	const boxRight = boxLeft + Math.abs(selectionBox.width)
	const boxBottom = boxTop + Math.abs(selectionBox.height)

	markers.forEach((markerElement) => {
		const rect = markerElement.getBoundingClientRect()
		const containerRect = parentElement.getBoundingClientRect()

		// Convert marker position to container-relative coordinates
		const markerLeft = rect.left - containerRect.left
		const markerTop = rect.top - containerRect.top
		const markerRight = markerLeft + rect.width
		const markerBottom = markerTop + rect.height

		// Check if boxes intersect
		const intersects =
			boxLeft < markerRight && boxRight > markerLeft && boxTop < markerBottom && boxBottom > markerTop

		if (intersects) {
			// Find the TimelineEvent component which has the data we need
			const eventElement = markerElement.querySelector('[data-event-key]')
			if (eventElement) {
				const eventKey = eventElement.getAttribute('data-event-key')
				const eventId = eventElement.getAttribute('data-event-id')
				if (eventKey && eventId) {
					selectedMarkerIds.add(JSON.stringify({ key: eventKey, eventId }))
				}
			}
		}
	})

	return Array.from(selectedMarkerIds).map((str) => JSON.parse(str) as { key: string; eventId: string })
}
