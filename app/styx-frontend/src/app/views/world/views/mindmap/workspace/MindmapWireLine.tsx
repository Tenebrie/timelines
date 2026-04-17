import { MindmapNode, MindmapWire } from '@api/types/mindmapTypes'
import { ActorDetails } from '@api/types/worldTypes'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useDispatch, useSelector } from 'react-redux'

import { useEventBusSubscribe } from '@/app/features/eventBus'
import { useCustomTheme } from '@/app/features/theming/hooks/useCustomTheme'
import { useDoubleClick } from '@/app/hooks/useDoubleClick'

import { mindmapSlice } from '../MindmapSlice'
import { getMindmapState } from '../MindmapSliceSelectors'
import {
	arrowPath,
	buildPathD,
	getNodeHeight,
	pathMidpoint,
	pickEdgePoints,
	WireEndpoints,
} from './mindmapWireUtils'

type Props = {
	wire: MindmapWire
	source: {
		node: MindmapNode
		actor: ActorDetails
	}
	target: {
		node: MindmapNode
		actor: ActorDetails
	}
	svgDefsPortal: SVGDefsElement
	svgGroupPortal: SVGGElement
	onOpenPopover: (position: { x: number; y: number }, mode: 'doubleClick' | 'contextMenu') => void
}

export function MindmapWireLine({
	wire,
	source,
	target,
	svgDefsPortal,
	svgGroupPortal,
	onOpenPopover,
}: Props) {
	const pathRef = useRef<SVGPathElement>(null)
	const hitPathRef = useRef<SVGPathElement>(null)
	const gradientRef = useRef<SVGLinearGradientElement>(null)
	const srcPortRef = useRef<SVGGElement>(null)
	const tgtPortRef = useRef<SVGGElement>(null)
	const srcArrowRef = useRef<SVGPathElement>(null)
	const tgtArrowRef = useRef<SVGPathElement>(null)
	const labelRef = useRef<SVGTextElement>(null)
	const arrowSizeRef = useRef(-1)
	const arrowAnimRef = useRef(0)

	const gradientId = `link-gradient-${source.node.id}-${target.node.id}`

	const posRef = useRef({
		srcX: source.node.positionX,
		srcY: source.node.positionY,
		tgtX: target.node.positionX,
		tgtY: target.node.positionY,
	})

	const showSourceArrow = wire.direction === 'Reversed' || wire.direction === 'TwoWay'
	const showTargetArrow = wire.direction === 'Normal' || wire.direction === 'TwoWay'

	const getTargetArrowSize = () => (selectedRef.current ? 16 : isHoveredRef.current ? 12 : 8)

	const updateDom = (ep: WireEndpoints) => {
		const d = buildPathD(ep)
		pathRef.current?.setAttribute('d', d)
		hitPathRef.current?.setAttribute('d', d)
		gradientRef.current?.setAttribute('x1', String(ep.x1))
		gradientRef.current?.setAttribute('y1', String(ep.y1))
		gradientRef.current?.setAttribute('x2', String(ep.x2))
		gradientRef.current?.setAttribute('y2', String(ep.y2))
		srcPortRef.current?.setAttribute('transform', `translate(${ep.x1}, ${ep.y1})`)
		tgtPortRef.current?.setAttribute('transform', `translate(${ep.x2}, ${ep.y2})`)
		const size = arrowSizeRef.current
		srcArrowRef.current?.setAttribute('d', arrowPath(ep.x1, ep.y1, -ep.nx1, -ep.ny1, size))
		tgtArrowRef.current?.setAttribute('d', arrowPath(ep.x2, ep.y2, -ep.nx2, -ep.ny2, size))
		const mid = pathMidpoint(ep)
		labelRef.current?.setAttribute('x', String(mid.x))
		labelRef.current?.setAttribute('y', String(mid.y))
	}

	useEventBusSubscribe['mindmap/node/onMove']({
		callback: (data) => {
			if (!pathRef.current || !gradientRef.current) return
			const pos = posRef.current
			if (data.nodeId === source.node.id) {
				pos.srcX = data.positionX
				pos.srcY = data.positionY
			}
			if (data.nodeId === target.node.id) {
				pos.tgtX = data.positionX
				pos.tgtY = data.positionY
			}
			const srcH = getNodeHeight(source.node.id)
			const tgtH = getNodeHeight(target.node.id)
			const ep = pickEdgePoints(pos.srcX, pos.srcY, srcH, pos.tgtX, pos.tgtY, tgtH)
			updateDom(ep)
		},
	})

	const srcH = getNodeHeight(source.node.id)
	const tgtH = getNodeHeight(target.node.id)
	const ep = pickEdgePoints(
		source.node.positionX,
		source.node.positionY,
		srcH,
		target.node.positionX,
		target.node.positionY,
		tgtH,
	)
	const { x1, y1, x2, y2, nx1, ny1, nx2, ny2 } = ep

	const isHoveredRef = useRef(false)

	const { selectedWires } = useSelector(getMindmapState, (a, b) => a.selectedWires === b.selectedWires)
	const selected = useMemo(() => selectedWires.includes(wire.id), [selectedWires, wire.id])
	const selectedRef = useRef(selected)
	selectedRef.current = selected

	if (arrowSizeRef.current < 0) {
		arrowSizeRef.current = selected ? 16 : 8
	}
	const { addWireToSelection, removeWireFromSelection } = mindmapSlice.actions
	const dispatch = useDispatch()

	const { triggerClick } = useDoubleClick<{ multiselect: boolean; event: React.MouseEvent }>({
		onClick: ({ multiselect }) => {
			if (selected) {
				dispatch(removeWireFromSelection(wire.id))
			} else {
				dispatch(addWireToSelection({ wireId: wire.id, multiselect }))
			}
		},
		onDoubleClick: ({ event, multiselect }) => {
			onOpenPopover({ x: event.clientX, y: event.clientY }, 'doubleClick')
			dispatch(addWireToSelection({ wireId: wire.id, multiselect }))
		},
		ignoreDelay: true,
	})

	const theme = useCustomTheme()
	const shadowColor = theme.mode === 'light' ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.6)'

	const maxLabelLength = 24
	const labelText = wire.content
		? wire.content.length > maxLabelLength
			? wire.content.slice(0, maxLabelLength) + '…'
			: wire.content
		: ''

	const updateStrokeWidth = useCallback(() => {
		const width = selectedRef.current ? 4 : isHoveredRef.current ? 3 : 2
		pathRef.current?.setAttribute('stroke-width', String(width))
		srcArrowRef.current?.setAttribute('stroke-width', String(width))
		tgtArrowRef.current?.setAttribute('stroke-width', String(width))

		const targetSize = getTargetArrowSize()
		const startSize = arrowSizeRef.current
		if (startSize === targetSize) return

		cancelAnimationFrame(arrowAnimRef.current)
		const startTime = performance.now()
		const duration = 200

		const step = (now: number) => {
			const t = Math.min((now - startTime) / duration, 1)
			const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
			const size = startSize + (targetSize - startSize) * eased
			arrowSizeRef.current = size

			const pos = posRef.current
			const srcH = getNodeHeight(source.node.id)
			const tgtH = getNodeHeight(target.node.id)
			const ep = pickEdgePoints(pos.srcX, pos.srcY, srcH, pos.tgtX, pos.tgtY, tgtH)
			srcArrowRef.current?.setAttribute('d', arrowPath(ep.x1, ep.y1, -ep.nx1, -ep.ny1, size))
			tgtArrowRef.current?.setAttribute('d', arrowPath(ep.x2, ep.y2, -ep.nx2, -ep.ny2, size))

			if (t < 1) {
				arrowAnimRef.current = requestAnimationFrame(step)
			}
		}

		arrowAnimRef.current = requestAnimationFrame(step)
	}, [source.node.id, target.node.id])

	useEffect(() => {
		updateStrokeWidth()
		return () => cancelAnimationFrame(arrowAnimRef.current)
	}, [selected, updateStrokeWidth])

	return (
		<>
			{createPortal(
				<linearGradient
					ref={gradientRef}
					id={gradientId}
					gradientUnits="userSpaceOnUse"
					x1={x1}
					y1={y1}
					x2={x2}
					y2={y2}
				>
					<stop offset="0%" stopColor={source.actor.color} />
					<stop offset="100%" stopColor={target.actor.color} />
				</linearGradient>,
				svgDefsPortal,
			)}
			{createPortal(
				<>
					<path
						ref={pathRef}
						data-mindmap-wire={wire.id}
						d={buildPathD(ep)}
						fill="none"
						pointerEvents="none"
						strokeWidth={selected ? 4 : 2}
						style={{
							stroke: `url(#${gradientId})`,
							transition: 'stroke-width 0.3s, filter 0.3s',
							filter: selected ? `drop-shadow(0 0 2px ${shadowColor})` : 'none',
						}}
					/>
					<path
						ref={hitPathRef}
						d={buildPathD(ep)}
						fill="none"
						stroke="transparent"
						strokeWidth={16}
						pointerEvents="auto"
						style={{ cursor: 'pointer' }}
						onClick={(event) => triggerClick(event, { multiselect: event.shiftKey, event })}
						onMouseEnter={() => {
							isHoveredRef.current = true
							updateStrokeWidth()
						}}
						onMouseLeave={() => {
							isHoveredRef.current = false
							updateStrokeWidth()
						}}
					/>
					{!showSourceArrow && (
						<g ref={srcPortRef} transform={`translate(${x1}, ${y1})`}>
							<circle
								cx="0"
								cy="0"
								r="3"
								fill={source.actor.color}
								stroke={source.actor.color}
								strokeWidth="2"
							/>
						</g>
					)}
					{!showTargetArrow && (
						<g ref={tgtPortRef} transform={`translate(${x2}, ${y2})`}>
							<circle
								cx="0"
								cy="0"
								r="3"
								fill={target.actor.color}
								stroke={target.actor.color}
								strokeWidth="2"
							/>
						</g>
					)}
					{showSourceArrow && (
						<path
							ref={srcArrowRef}
							d={arrowPath(x1, y1, -nx1, -ny1, arrowSizeRef.current)}
							fill="none"
							stroke={source.actor.color}
							strokeWidth={selected ? 4 : 2}
							strokeLinecap="round"
							strokeLinejoin="round"
							pointerEvents="none"
							style={{ transition: 'stroke-width 0.3s' }}
						/>
					)}
					{showTargetArrow && (
						<path
							ref={tgtArrowRef}
							d={arrowPath(x2, y2, -nx2, -ny2, arrowSizeRef.current)}
							fill="none"
							stroke={target.actor.color}
							strokeWidth={selected ? 4 : 2}
							strokeLinecap="round"
							strokeLinejoin="round"
							pointerEvents="none"
							style={{ transition: 'stroke-width 0.3s' }}
						/>
					)}
					{labelText && (
						<text
							ref={labelRef}
							x={pathMidpoint(ep).x}
							y={pathMidpoint(ep).y}
							textAnchor="middle"
							dominantBaseline="middle"
							pointerEvents="none"
							fontSize="16"
							fill={theme.mode === 'light' ? '#333' : '#ddd'}
							style={{
								paintOrder: 'stroke',
								stroke: theme.mode === 'light' ? '#fff' : theme.custom.palette.background.timeline,
								strokeWidth: 3,
								strokeLinejoin: 'round',
								userSelect: 'none',
							}}
						>
							{labelText}
						</text>
					)}
				</>,
				svgGroupPortal,
			)}
		</>
	)
}
