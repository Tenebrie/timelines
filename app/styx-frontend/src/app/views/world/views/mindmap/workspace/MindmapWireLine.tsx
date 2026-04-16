import { MindmapNode } from '@api/types/mindmapTypes'
import { ActorDetails } from '@api/types/worldTypes'
import { useRef } from 'react'
import { createPortal } from 'react-dom'

import { useEventBusSubscribe } from '@/app/features/eventBus'

import { buildPathD, getNodeHeight, pickEdgePoints, WireEndpoints } from './mindmapWireUtils'

type Props = {
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
}

export function MindmapWireLine({ source, target, svgDefsPortal, svgGroupPortal }: Props) {
	const pathRef = useRef<SVGPathElement>(null)
	const gradientRef = useRef<SVGLinearGradientElement>(null)
	const srcPortRef = useRef<SVGGElement>(null)
	const tgtPortRef = useRef<SVGGElement>(null)

	const gradientId = `link-gradient-${source.node.id}-${target.node.id}`

	const posRef = useRef({
		srcX: source.node.positionX,
		srcY: source.node.positionY,
		tgtX: target.node.positionX,
		tgtY: target.node.positionY,
	})

	const updateDom = (ep: WireEndpoints) => {
		pathRef.current?.setAttribute('d', buildPathD(ep))
		gradientRef.current?.setAttribute('x1', String(ep.x1))
		gradientRef.current?.setAttribute('y1', String(ep.y1))
		gradientRef.current?.setAttribute('x2', String(ep.x2))
		gradientRef.current?.setAttribute('y2', String(ep.y2))
		srcPortRef.current?.setAttribute('transform', `translate(${ep.x1}, ${ep.y1})`)
		tgtPortRef.current?.setAttribute('transform', `translate(${ep.x2}, ${ep.y2})`)
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
	const { x1, y1, x2, y2 } = ep

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
						d={buildPathD(ep)}
						fill="none"
						// vectorEffect="non-scaling-stroke"
						style={{ stroke: `url(#${gradientId})`, strokeWidth: 2 }}
					/>
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
				</>,
				svgGroupPortal,
			)}
		</>
	)
}
