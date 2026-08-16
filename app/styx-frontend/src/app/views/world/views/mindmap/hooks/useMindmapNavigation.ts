import { CSSProperties, RefObject, useEffect, useRef } from 'react'
import z from 'zod'

import usePersistentStateRef from '@/app/hooks/usePersistentStateRef'

const MIN_SCALE = 0.125
const MAX_SCALE = 5

// Safari reports trackpad pinches via proprietary gesture events instead of ctrl+wheel
interface SafariGestureEvent extends Event {
	readonly scale: number
	readonly clientX: number
	readonly clientY: number
}

function isGestureEvent(event: Event): event is SafariGestureEvent {
	return 'scale' in event && 'clientX' in event
}

export function useMindmapNavigation(ref: RefObject<HTMLDivElement | null>) {
	const [state, setState] = usePersistentStateRef(
		'mindmap',
		z.object({
			position: z.object({
				x: z.number(),
				y: z.number(),
			}),
			scale: z.number().min(0),
		}),
		{
			position: { x: 0, y: 0 },
			scale: 1,
		},
		sessionStorage,
	)

	const variables = useRef({
		'--grid-offset-x': `${state.current.position.x}px`,
		'--grid-offset-y': `${state.current.position.y}px`,
		'--grid-scale': state.current.scale,
	} as CSSProperties)

	useEffect(() => {
		const element = ref.current
		if (!element) {
			return
		}

		const navState = {
			isDragging: false,
			dragMode: 'select' as 'select' | 'pan',
			gridOffsetX: state.current.position.x,
			gridOffsetY: state.current.position.y,
			gridScale: state.current.scale,
			elementRect: element.getBoundingClientRect(),
			lastTrackpadPanAt: -Infinity,
			pinchStartScale: 1,
		}

		const touchState = {
			mode: 'none' as 'none' | 'pan' | 'pinch',
			lastX: 0,
			lastY: 0,
			lastDistance: 0,
		}

		const resizeObserver = new ResizeObserver((entries) => {
			for (const entry of entries) {
				if (entry.target === element) {
					navState.elementRect = element.getBoundingClientRect()
					update()
				}
			}
		})
		resizeObserver.observe(element)

		const update = () =>
			requestAnimationFrame(() => {
				const gestureActive =
					(navState.isDragging && navState.dragMode === 'pan') || touchState.mode !== 'none'
				element.style.setProperty('--grid-offset-x', `${navState.gridOffsetX}px`)
				element.style.setProperty('--grid-offset-y', `${navState.gridOffsetY}px`)
				element.style.setProperty('--grid-scale', navState.gridScale.toString())
				element.style.setProperty('--transition-duration', `${gestureActive ? 0.0 : 0.1}s`)

				setState(() => ({
					position: {
						x: navState.gridOffsetX,
						y: navState.gridOffsetY,
					},
					scale: navState.gridScale,
				}))
			})
		update()

		const zoomAt = (originX: number, originY: number, newScaleRaw: number) => {
			const oldScale = navState.gridScale
			const newScale = Math.min(Math.max(MIN_SCALE, newScaleRaw), MAX_SCALE)
			const scaleFactor = newScale / oldScale
			navState.gridOffsetX = originX - scaleFactor * (originX - navState.gridOffsetX)
			navState.gridOffsetY = originY - scaleFactor * (originY - navState.gridOffsetY)
			navState.gridScale = newScale
		}

		const handleMouseDown = (event: MouseEvent) => {
			if (event.button === 0) {
				navState.isDragging = true
				navState.dragMode = 'select'
			} else if (event.button === 2) {
				navState.isDragging = true
				navState.dragMode = 'pan'
			}
		}

		const handleMouseUp = (event: MouseEvent) => {
			if (!navState.isDragging) {
				return
			}
			if (event.button === 0 && navState.dragMode === 'select') {
				navState.isDragging = false
			}
			if (event.button === 2 && navState.dragMode === 'pan') {
				navState.isDragging = false
			}
			update()
		}

		const handleMouseMove = (event: MouseEvent) => {
			if (!navState.isDragging) {
				return
			}

			if (navState.dragMode === 'pan') {
				navState.gridOffsetX += event.movementX
				navState.gridOffsetY += event.movementY
			}
			update()
		}

		const handleWheel = (event: WheelEvent) => {
			event.preventDefault()

			const originX = event.clientX - navState.elementRect.left
			const originY = event.clientY - navState.elementRect.top

			// Trackpad pinch arrives as ctrl+wheel with fine-grained deltas
			if (event.ctrlKey || event.metaKey) {
				zoomAt(originX, originY, navState.gridScale * Math.exp(-event.deltaY / 100))
				update()
				return
			}

			// Two-finger trackpad scroll pans; a discrete mouse wheel zooms. There is no
			// reliable API to tell them apart, so detect trackpads by their pixel-mode,
			// often-fractional, often-horizontal deltas and keep the decision sticky
			// through the gesture to absorb fast integer-delta flicks mid-scroll.
			const looksLikeTrackpad =
				event.deltaMode === WheelEvent.DOM_DELTA_PIXEL &&
				(event.deltaX !== 0 || !Number.isInteger(event.deltaY) || Math.abs(event.deltaY) < 40)
			if (looksLikeTrackpad || event.timeStamp - navState.lastTrackpadPanAt < 300) {
				navState.lastTrackpadPanAt = event.timeStamp
				navState.gridOffsetX -= event.deltaX
				navState.gridOffsetY -= event.deltaY
				update()
				return
			}

			zoomAt(originX, originY, navState.gridScale * Math.exp(-event.deltaY / 800))
			update()
		}

		const getTouchMidpoint = (touches: TouchList) => {
			const [a, b] = [touches[0], touches[1]]
			return {
				x: (a.clientX + b.clientX) / 2 - navState.elementRect.left,
				y: (a.clientY + b.clientY) / 2 - navState.elementRect.top,
				distance: Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY),
			}
		}

		const handleTouchStart = (event: TouchEvent) => {
			if (event.touches.length >= 2) {
				const { x, y, distance } = getTouchMidpoint(event.touches)
				touchState.mode = 'pinch'
				touchState.lastX = x
				touchState.lastY = y
				touchState.lastDistance = distance
				event.preventDefault()
				return
			}

			// A single finger on a node is left for the node itself to handle
			const target = event.target
			if (target instanceof HTMLElement && target.closest('[data-mindmap-node]')) {
				touchState.mode = 'none'
				return
			}

			touchState.mode = 'pan'
			touchState.lastX = event.touches[0].clientX
			touchState.lastY = event.touches[0].clientY
		}

		const handleTouchMove = (event: TouchEvent) => {
			if (touchState.mode === 'pinch' && event.touches.length >= 2) {
				event.preventDefault()
				const { x, y, distance } = getTouchMidpoint(event.touches)
				if (touchState.lastDistance > 0) {
					zoomAt(x, y, navState.gridScale * (distance / touchState.lastDistance))
				}
				navState.gridOffsetX += x - touchState.lastX
				navState.gridOffsetY += y - touchState.lastY
				touchState.lastX = x
				touchState.lastY = y
				touchState.lastDistance = distance
				update()
				return
			}

			if (touchState.mode === 'pan' && event.touches.length === 1) {
				event.preventDefault()
				const touch = event.touches[0]
				navState.gridOffsetX += touch.clientX - touchState.lastX
				navState.gridOffsetY += touch.clientY - touchState.lastY
				touchState.lastX = touch.clientX
				touchState.lastY = touch.clientY
				update()
			}
		}

		const handleTouchEnd = (event: TouchEvent) => {
			if (event.touches.length >= 2) {
				return
			}
			if (event.touches.length === 1) {
				touchState.mode = 'pan'
				touchState.lastX = event.touches[0].clientX
				touchState.lastY = event.touches[0].clientY
				touchState.lastDistance = 0
				return
			}
			touchState.mode = 'none'
			update()
		}

		const handleGestureStart = (event: Event) => {
			if (touchState.mode !== 'none') {
				return
			}
			event.preventDefault()
			navState.pinchStartScale = navState.gridScale
		}

		const handleGestureChange = (event: Event) => {
			if (touchState.mode !== 'none' || !isGestureEvent(event)) {
				return
			}
			event.preventDefault()
			zoomAt(
				event.clientX - navState.elementRect.left,
				event.clientY - navState.elementRect.top,
				navState.pinchStartScale * event.scale,
			)
			update()
		}

		const handleContextMenu = (event: MouseEvent) => {
			event.preventDefault()
		}

		element.addEventListener('mousedown', handleMouseDown)
		element.addEventListener('wheel', handleWheel, { passive: false })
		element.addEventListener('touchstart', handleTouchStart, { passive: false })
		element.addEventListener('touchmove', handleTouchMove, { passive: false })
		element.addEventListener('touchend', handleTouchEnd)
		element.addEventListener('touchcancel', handleTouchEnd)
		element.addEventListener('gesturestart', handleGestureStart)
		element.addEventListener('gesturechange', handleGestureChange)
		element.addEventListener('contextmenu', handleContextMenu)
		window.addEventListener('mousemove', handleMouseMove)
		window.addEventListener('mouseup', handleMouseUp)

		return () => {
			resizeObserver.disconnect()
			element.removeEventListener('mousedown', handleMouseDown)
			element.removeEventListener('wheel', handleWheel)
			element.removeEventListener('touchstart', handleTouchStart)
			element.removeEventListener('touchmove', handleTouchMove)
			element.removeEventListener('touchend', handleTouchEnd)
			element.removeEventListener('touchcancel', handleTouchEnd)
			element.removeEventListener('gesturestart', handleGestureStart)
			element.removeEventListener('gesturechange', handleGestureChange)
			element.removeEventListener('contextmenu', handleContextMenu)
			window.removeEventListener('mousemove', handleMouseMove)
			window.removeEventListener('mouseup', handleMouseUp)
		}
	}, [ref, setState, state])

	return variables
}
