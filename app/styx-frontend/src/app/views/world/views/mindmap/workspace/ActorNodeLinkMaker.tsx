import { MindmapNode } from '@api/types/mindmapTypes'
import Box from '@mui/material/Box'
import { useEffect, useRef } from 'react'

import { useDragDrop } from '@/app/features/dragDrop/hooks/useDragDrop'

type Props = {
	node: MindmapNode
}

export function ActorNodeLinkMaker({ node }: Props) {
	const isDragging = useRef(false)

	const { ref, ghostElement } = useDragDrop({
		type: 'actorNodeLinking',
		ghostFactory: () => <div style={{ width: 12, height: 12, background: 'gold', borderRadius: '50%' }} />,
		params: {
			sourceNode: node,
		},
	})

	useEffect(() => {
		if (!ref.current) {
			return
		}
		const onMouseDown = (event: MouseEvent) => {
			isDragging.current = true
			event.stopPropagation()
			event.preventDefault()
		}

		const box = ref.current

		box.addEventListener('mousedown', onMouseDown)
		return () => {
			box.removeEventListener('mousedown', onMouseDown)
		}
	}, [node.id, ref])

	return (
		<>
			<Box
				ref={ref}
				sx={{
					width: 12,
					height: 12,
					background: 'gold',
					borderRadius: '50%',
					cursor: 'pointer',
				}}
			/>
			{ghostElement}
		</>
	)
}
