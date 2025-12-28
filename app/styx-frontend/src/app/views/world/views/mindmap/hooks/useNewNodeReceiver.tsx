import { RefObject } from 'react'

import { useDragDropReceiver } from '@/app/features/dragDrop/hooks/useDragDropReceiver'

import { useCreateMindmapNode } from '../api/useCreateMindmapNode'

type Props = {
	ref: RefObject<HTMLDivElement | null>
}

export function useNewNodeReceiver({ ref }: Props) {
	const [createMindmapNode] = useCreateMindmapNode()

	useDragDropReceiver({
		type: 'newMindmapNode',
		receiverRef: ref,
		onDrop: ({ params, targetPos }) => {
			const boundingBox = ref.current!.getBoundingClientRect()
			const style = getComputedStyle(ref.current!)
			const offsetX = parseFloat(style.getPropertyValue('--grid-offset-x'))
			const offsetY = parseFloat(style.getPropertyValue('--grid-offset-y'))
			const scale = parseFloat(style.getPropertyValue('--grid-scale'))
			createMindmapNode({
				positionX: (targetPos.x - boundingBox.x - offsetX) / scale,
				positionY: (targetPos.y - boundingBox.y - offsetY) / scale,
				parentActorId: params.actor.id,
			})
		},
	})

	return { ref }
}
