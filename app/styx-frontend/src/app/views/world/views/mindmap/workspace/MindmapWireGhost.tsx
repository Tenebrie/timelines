import { useCallback, useEffect, useRef, useState } from 'react'

import { DragDropState, IsDragDropStateOfType } from '@/app/features/dragDrop/DragDropState'
import { useDragDropBusSubscribe } from '@/app/features/dragDrop/hooks/useDragDropBus'
import { useCustomTheme } from '@/app/features/theming/hooks/useCustomTheme'

import {
	buildPathD,
	getNodeHeight,
	nearestEdgePoint,
	NODE_W,
	pickEdgePoints,
	WireEndpoints,
} from './mindmapWireUtils'

type Props = {
	existingWires: Set<string>
}

export function MindmapWireGhost({ existingWires }: Props) {
	const [isDragging, setIsDragging] = useState(false)
	const pathRef = useRef<SVGPathElement>(null)
	const gradientRef = useRef<SVGLinearGradientElement>(null)
	const srcPortRef = useRef<SVGGElement>(null)
	const tgtPortRef = useRef<SVGGElement>(null)
	const theme = useCustomTheme()

	useDragDropBusSubscribe({
		callback: useCallback((state) => {
			setIsDragging(IsDragDropStateOfType(state, 'actorNodeLinking'))
		}, []),
	})

	const strokeColorStart = theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)'
	const strokeColorEnd = theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'
	const snapColorStart = theme.mode === 'dark' ? 'rgba(100, 180, 255, 0.9)' : 'rgba(30, 100, 200, 0.9)'
	const snapColorEnd = theme.mode === 'dark' ? 'rgba(100, 180, 255, 0.4)' : 'rgba(30, 100, 200, 0.4)'
	const duplicateColorStart = theme.mode === 'dark' ? 'rgba(255, 100, 100, 0.9)' : 'rgba(200, 30, 30, 0.9)'
	const duplicateColorEnd = theme.mode === 'dark' ? 'rgba(255, 100, 100, 0.4)' : 'rgba(200, 30, 30, 0.4)'

	useEffect(() => {
		if (!isDragging) {
			return
		}

		const updateDom = (ep: WireEndpoints, colorStart: string, colorEnd: string) => {
			pathRef.current?.setAttribute('d', buildPathD(ep))
			gradientRef.current?.setAttribute('x1', String(ep.x1))
			gradientRef.current?.setAttribute('y1', String(ep.y1))
			gradientRef.current?.setAttribute('x2', String(ep.x2))
			gradientRef.current?.setAttribute('y2', String(ep.y2))
			const stops = gradientRef.current?.querySelectorAll('stop')
			if (stops) {
				stops[0]?.setAttribute('stop-color', colorEnd)
				stops[1]?.setAttribute('stop-color', colorStart)
				stops[2]?.setAttribute('stop-color', colorEnd)
			}
			srcPortRef.current?.querySelector('circle')?.setAttribute('fill', colorStart)
			srcPortRef.current?.querySelector('circle')?.setAttribute('stroke', colorStart)
			tgtPortRef.current?.querySelector('circle')?.setAttribute('fill', colorEnd)
			tgtPortRef.current?.querySelector('circle')?.setAttribute('stroke', colorEnd)
			srcPortRef.current?.setAttribute('transform', `translate(${ep.x1}, ${ep.y1})`)
			tgtPortRef.current?.setAttribute('transform', `translate(${ep.x2}, ${ep.y2})`)
		}

		const handleMouseMove = (event: MouseEvent) => {
			const el = pathRef.current
			if (!el) {
				return
			}

			const state = DragDropState.current
			if (!IsDragDropStateOfType(state, 'actorNodeLinking')) {
				return
			}

			const gridContainer = el.closest('[data-mindmap-grid]') as HTMLElement | null
			if (!gridContainer) {
				return
			}

			const style = getComputedStyle(gridContainer)
			const offsetX = parseFloat(style.getPropertyValue('--grid-offset-x'))
			const offsetY = parseFloat(style.getPropertyValue('--grid-offset-y'))
			const scale = parseFloat(style.getPropertyValue('--grid-scale'))
			const rect = gridContainer.getBoundingClientRect()

			// Convert mouse screen coords to grid coords
			const mouseGridX = (event.clientX - rect.x - offsetX) / scale
			const mouseGridY = (event.clientY - rect.y - offsetY) / scale

			const srcX = state.params.sourceNode.positionX
			const srcY = state.params.sourceNode.positionY
			const srcH = getNodeHeight(state.params.sourceNode.id)

			// Check if mouse is over a target node and snap to it
			let ep: WireEndpoints
			const elementsUnder = document.elementsFromPoint(event.clientX, event.clientY)
			let snappedId: string | null = null
			for (const elem of elementsUnder) {
				const nodeElement = elem.closest('[data-mindmap-node]') as HTMLElement | null
				if (nodeElement) {
					const nodeId = nodeElement.getAttribute('data-mindmap-node')
					if (nodeId !== state.params.sourceNode.id) {
						const nodeX = parseFloat(nodeElement.style.getPropertyValue('--node-x'))
						const nodeY = parseFloat(nodeElement.style.getPropertyValue('--node-y'))
						const tgtH = getNodeHeight(nodeId!)
						ep = pickEdgePoints(srcX, srcY, srcH, nodeX, nodeY, tgtH)
						snappedId = nodeId
						break
					}
				}
			}

			let activeColorStart = strokeColorStart
			let activeColorEnd = strokeColorEnd

			if (!snappedId) {
				// Source edge aimed at mouse position
				const src = nearestEdgePoint(srcX, srcY, srcH, mouseGridX, mouseGridY)

				// Target normal: points back toward source (matching real wire behavior)
				const srcCenterX = srcX + NODE_W / 2
				const srcCenterY = srcY + srcH / 2
				const dx = mouseGridX - srcCenterX
				const dy = mouseGridY - srcCenterY
				const len = Math.hypot(dx, dy) || 1

				ep = {
					x1: src.x,
					y1: src.y,
					x2: mouseGridX,
					y2: mouseGridY,
					nx1: src.nx,
					ny1: src.ny,
					nx2: -dx / len,
					ny2: -dy / len,
				}
			} else {
				const linkId = `${state.params.sourceNode.id}->${snappedId}`
				const reverseLinkId = `${snappedId}->${state.params.sourceNode.id}`
				if (existingWires.has(linkId) || existingWires.has(reverseLinkId)) {
					activeColorStart = duplicateColorStart
					activeColorEnd = duplicateColorEnd
				} else {
					activeColorStart = snapColorStart
					activeColorEnd = snapColorEnd
				}
			}

			updateDom(ep!, activeColorStart, activeColorEnd)
		}

		window.addEventListener('mousemove', handleMouseMove)
		return () => {
			window.removeEventListener('mousemove', handleMouseMove)
		}
	}, [
		existingWires,
		isDragging,
		strokeColorStart,
		strokeColorEnd,
		snapColorStart,
		snapColorEnd,
		duplicateColorStart,
		duplicateColorEnd,
	])

	if (!isDragging) {
		return null
	}

	const state = DragDropState.current
	if (!IsDragDropStateOfType(state, 'actorNodeLinking')) {
		return null
	}

	const srcX = state.params.sourceNode.positionX
	const srcY = state.params.sourceNode.positionY
	const srcH = getNodeHeight(state.params.sourceNode.id)
	const src = nearestEdgePoint(srcX, srcY, srcH, srcX + NODE_W, srcY + srcH / 2)

	return (
		<svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0, overflow: 'visible' }}>
			<defs>
				<linearGradient
					ref={gradientRef}
					id="link-ghost-gradient"
					gradientUnits="userSpaceOnUse"
					x1={src.x}
					y1={src.y}
					x2={src.x}
					y2={src.y}
				>
					<stop offset="0%" stopColor={strokeColorEnd}>
						<animate attributeName="offset" values="-0.30;1.0" dur="2s" repeatCount="indefinite" />
					</stop>
					<stop offset="0%" stopColor={strokeColorStart}>
						<animate attributeName="offset" values="-0.15;1.15" dur="2s" repeatCount="indefinite" />
					</stop>
					<stop offset="0%" stopColor={strokeColorEnd}>
						<animate attributeName="offset" values="-0.0;1.30" dur="2s" repeatCount="indefinite" />
					</stop>
				</linearGradient>
			</defs>
			<g
				style={{
					transform: 'translate(var(--grid-offset-x), var(--grid-offset-y)) scale(var(--grid-scale))',
					transformOrigin: '0 0',
					transition: 'transform var(--transition-duration) ease-out',
				}}
			>
				<path
					ref={pathRef}
					d={`M ${src.x},${src.y} C ${src.x},${src.y} ${src.x},${src.y} ${src.x},${src.y}`}
					fill="none"
					vectorEffect="non-scaling-stroke"
					style={{ stroke: 'url(#link-ghost-gradient)', strokeWidth: 2 }}
				/>
				<g ref={srcPortRef} transform={`translate(${src.x}, ${src.y})`}>
					<circle cx="0" cy="0" r="4" fill={strokeColorStart} strokeWidth="0" />
				</g>
			</g>
		</svg>
	)
}
