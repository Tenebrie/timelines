import { MindmapLink, MindmapNode } from '@api/types/mindmapTypes'
import { ActorDetails } from '@api/types/worldTypes'
import { useRef } from 'react'

import { useEventBusSubscribe } from '@/app/features/eventBus'

type Props = {
	link: MindmapLink
	source: {
		node: MindmapNode
		actor: ActorDetails
	}
	target: {
		node: MindmapNode
		actor: ActorDetails
	}
}

export function ActorNodeLink({ source, target }: Props) {
	const lineRef = useRef<SVGLineElement>(null)
	const gradientRef = useRef<SVGLinearGradientElement>(null)

	const gradientId = `link-gradient-${source.node.id}-${target.node.id}`

	useEventBusSubscribe['mindmap/node/onMove']({
		callback: (data) => {
			const el = lineRef.current
			const grad = gradientRef.current
			if (!el || !grad) {
				return
			}
			if (data.nodeId === source.node.id) {
				el.setAttribute('x1', String(data.positionX + 125))
				el.setAttribute('y1', String(data.positionY + 25))
				grad.setAttribute('x1', String(data.positionX + 125))
				grad.setAttribute('y1', String(data.positionY + 25))
			}
			if (data.nodeId === target.node.id) {
				el.setAttribute('x2', String(data.positionX + 125))
				el.setAttribute('y2', String(data.positionY + 25))
				grad.setAttribute('x2', String(data.positionX + 125))
				grad.setAttribute('y2', String(data.positionY + 25))
			}
		},
	})

	return (
		<svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0, overflow: 'visible' }}>
			<defs>
				<linearGradient
					ref={gradientRef}
					id={gradientId}
					gradientUnits="userSpaceOnUse"
					x1={source.node.positionX + 125}
					y1={source.node.positionY + 25}
					x2={target.node.positionX + 125}
					y2={target.node.positionY + 25}
				>
					<stop offset="0%" stopColor="red" />
					<stop offset="100%" stopColor="blue" />
				</linearGradient>
			</defs>
			<g
				style={{
					transform: 'translate(var(--grid-offset-x), var(--grid-offset-y)) scale(var(--grid-scale))',
					transformOrigin: '0 0',
					transition: 'transform var(--transition-duration) ease-out',
				}}
			>
				<line
					ref={lineRef}
					x1={source.node.positionX + 125}
					y1={source.node.positionY + 25}
					x2={target.node.positionX + 125}
					y2={target.node.positionY + 25}
					vectorEffect="non-scaling-stroke"
					style={{ stroke: `url(#${gradientId})`, strokeWidth: 2 }}
				/>
			</g>
		</svg>
	)
}
