import { RefObject } from 'react'

import { useDragDropReceiver } from '@/app/features/dragDrop/hooks/useDragDropReceiver'

import { useCreateMindmapNode } from '../api/useCreateMindmapNode'

type Props = {
	ref: RefObject<HTMLDivElement | null>
}

export function useNewNodeReceiver({ ref }: Props) {
	const [createMindmapNode] = useCreateMindmapNode()

	function createNodeAt(targetPos: { x: number; y: number }, parentActorId: string) {
		const boundingBox = ref.current!.getBoundingClientRect()
		const style = getComputedStyle(ref.current!)
		const offsetX = parseFloat(style.getPropertyValue('--grid-offset-x'))
		const offsetY = parseFloat(style.getPropertyValue('--grid-offset-y'))
		const scale = parseFloat(style.getPropertyValue('--grid-scale'))
		createMindmapNode({
			positionX: (targetPos.x - boundingBox.x - offsetX) / scale,
			positionY: (targetPos.y - boundingBox.y - offsetY) / scale,
			parentActorId,
		})
	}

	useDragDropReceiver({
		type: 'newMindmapNode',
		receiverRef: ref,
		onDrop: ({ params, targetPos }) => {
			createNodeAt(targetPos, params.actor.id)
		},
	})

	useDragDropReceiver({
		type: 'articleListItem',
		receiverRef: ref,
		onDrop: ({ params, targetPos }, { markHandled }) => {
			if (params.article.type !== 'actor') {
				return
			}
			markHandled()
			createNodeAt(targetPos, params.article.entity.id)
		},
	})

	return { ref }
}
