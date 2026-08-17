import { WikiEntityType } from '@api/types/worldTypes'
import { RefObject } from 'react'

import { getGhostElementRect } from '@/app/features/dragDrop/components/GhostWrapper'
import { useDragDropReceiver } from '@/app/features/dragDrop/hooks/useDragDropReceiver'

import { useCreateMindmapNode } from '../api/useCreateMindmapNode'
import { getMindmapGridPosition } from '../utils/getMindmapGridPosition'

type Props = {
	ref: RefObject<HTMLDivElement | null>
}

export function useNewNodeReceiver({ ref }: Props) {
	const [createMindmapNode] = useCreateMindmapNode()

	function createNodeAt({
		targetPos,
		parentId,
		parentType,
	}: {
		targetPos: { x: number; y: number }
		parentId: string
		parentType: WikiEntityType
	}) {
		const gridPos = getMindmapGridPosition({ screenX: targetPos.x, screenY: targetPos.y })
		if (!gridPos) {
			return
		}

		const ghostRect = getGhostElementRect()
		const ghostHalfWidth = ghostRect ? ghostRect.width / 2 : 0
		const ghostHalfHeight = ghostRect ? ghostRect.height / 2 : 0

		createMindmapNode({
			positionX: Math.round(gridPos.x - ghostHalfWidth),
			positionY: Math.round(gridPos.y - ghostHalfHeight),
			parentActorId: parentType === 'actor' ? parentId : undefined,
			parentArticleId: parentType === 'article' ? parentId : undefined,
			parentEventId: parentType === 'event' ? parentId : undefined,
			parentFolderId: parentType === 'folder' ? parentId : undefined,
			parentTagId: parentType === 'tag' ? parentId : undefined,
		})
	}

	// // @deprecated
	// useDragDropReceiver({
	// 	type: 'newMindmapNode',
	// 	receiverRef: ref,
	// 	onDrop: ({ params, targetPos }) => {
	// 		createNodeAt(targetPos, params.actor.id)
	// 	},
	// })

	useDragDropReceiver({
		type: 'articleListItem',
		receiverRef: ref,
		onDrop: ({ params, targetPos }, { markHandled }) => {
			// if (params.article.type !== 'actor') {
			// 	return
			// }
			markHandled()
			createNodeAt({
				targetPos,
				parentId: params.article.entity.id,
				parentType: params.article.type,
			})
		},
	})

	return { ref }
}
