import { useGetMindmapQuery } from '@api/mindmapApi'
import { MindmapNode } from '@api/types/mindmapTypes'
import { Actor } from '@api/types/worldTypes'
import Box from '@mui/material/Box'
import { useCallback, useMemo, useRef, useState } from 'react'
import { useSelector } from 'react-redux'

import { useEffectOnce } from '@/app/utils/useEffectOnce'

import { getWorldState } from '../../../WorldSliceSelectors'
import { MindmapWireGhost } from './MindmapWireGhost'
import { MindmapWireLine } from './MindmapWireLine'
import { MindmapWirePopover, MindmapWireState } from './MindmapWirePopover'

type Props = {
	actorsWithNodes: { id: string; actor: Actor; node: MindmapNode }[]
}

export function MindmapWireLayer({ actorsWithNodes }: Props) {
	const { id: worldId } = useSelector(getWorldState, (a, b) => a.id === b.id && a.actors === b.actors)
	const { data } = useGetMindmapQuery({ worldId }, { skip: !worldId })

	const svgDefsRef = useRef<SVGDefsElement>(null)
	const svgGroupRef = useRef<SVGGElement>(null)
	const [refsReady, setRefsReady] = useState(false)

	useEffectOnce(() => {
		setRefsReady(true)
	})

	const [popoverState, setPopoverState] = useState<Omit<MindmapWireState, 'onClose'>>({
		open: false,
		position: { x: 0, y: 0 },
		mode: 'doubleClick',
	})

	const onOpenPopover = useCallback(
		(wireId: string, position: { x: number; y: number }, mode: 'doubleClick' | 'contextMenu') => {
			setPopoverState({ open: true, position, mode })
		},
		[],
	)

	const { nodeLinks, existingWires } = useMemo(() => {
		if (!data) {
			return {
				nodeLinks: [],
				existingWires: new Set<string>(),
			}
		}

		const nodeLinks = data.wires
			.map((link) => {
				const sourceNode = actorsWithNodes.find((node) => node.id === link.sourceNodeId)
				const targetNode = actorsWithNodes.find((node) => node.id === link.targetNodeId)
				if (!sourceNode || !targetNode) {
					return null
				}
				return {
					...link,
					sourceNode,
					targetNode,
				}
			})
			.filter((link): link is NonNullable<typeof link> => link !== null)

		const existingWires = new Set<string>()
		nodeLinks.forEach((link) => {
			existingWires.add(`${link.sourceNode.id}->${link.targetNode.id}`)
		})

		return { nodeLinks, existingWires }
	}, [data, actorsWithNodes])

	return (
		<Box
			sx={{
				position: 'absolute',
				inset: 0,
				pointerEvents: 'none',
				overflow: 'visible',
			}}
		>
			<svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0, overflow: 'visible' }}>
				<defs ref={svgDefsRef}></defs>
				<g
					ref={svgGroupRef}
					style={{
						willChange: 'transform',
						transform: 'translate(var(--grid-offset-x), var(--grid-offset-y)) scale(var(--grid-scale))',
						transformOrigin: '0 0',
						transition: 'transform var(--transition-duration) ease-out',
					}}
				></g>
			</svg>
			{refsReady &&
				nodeLinks.map((link) => (
					<MindmapWireLine
						key={link.id}
						wire={link}
						source={link.sourceNode}
						target={link.targetNode}
						svgDefsPortal={svgDefsRef.current!}
						svgGroupPortal={svgGroupRef.current!}
						onOpenPopover={(position, mode) => onOpenPopover(link.id, position, mode)}
					/>
				))}
			<MindmapWireGhost existingWires={existingWires} />
			<MindmapWirePopover
				{...popoverState}
				onClose={() => setPopoverState({ ...popoverState, open: false })}
			/>
		</Box>
	)
}
