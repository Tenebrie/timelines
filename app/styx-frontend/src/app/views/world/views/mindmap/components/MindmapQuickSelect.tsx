import { useSearch } from '@tanstack/react-router'
import { useCallback, useRef } from 'react'

import { QuickSelectList, QuickSelectListProps } from '@/app/components/QuickSelectList/QuickSelectList'
import { dispatchGlobalEvent, useEventBusSubscribe } from '@/app/features/eventBus'
import { useMousePositionRef } from '@/app/hooks/useMousePositionRef'
import { Shortcut, useShortcut } from '@/app/hooks/useShortcut/useShortcut'

import { useCreateMindmapNode } from '../api/useCreateMindmapNode'
import { useNodeLinking } from '../hooks/useNodeLinking'
import { getMindmapGridPosition } from '../utils/getMindmapGridPosition'
import { NODE_FALLBACK_H, NODE_W } from '../workspace/mindmapWireUtils'

export function MindmapQuickSelect() {
	const selectedEntityIds = useSearch({
		from: '/world/$worldId/_world',
		select: (search) => search.navi,
	})

	const mousePos = useMousePositionRef()
	const [createMindmapNode] = useCreateMindmapNode()
	const { createLinks } = useNodeLinking()

	useShortcut(Shortcut.OpenQuickSelect, () => {
		dispatchGlobalEvent['quickSelect/requestOpen']({
			query: '',
			screenPosTop: mousePos.current.y,
			screenPosBottom: mousePos.current.y,
			screenPosLeft: mousePos.current.x,
		})
	})

	const spawnPos = useRef({ x: 0, y: 0 })
	useEventBusSubscribe['quickSelect/requestOpen']({
		callback: ({ screenPosTop, screenPosLeft }) => {
			spawnPos.current = { x: screenPosLeft, y: screenPosTop }
		},
	})

	const wireSourceIds = useRef<string[]>([])
	useEventBusSubscribe['mindmap/wire/requestNodeTarget']({
		callback: ({ sourceNodeIds }) => {
			wireSourceIds.current = sourceNodeIds
		},
	})
	useEventBusSubscribe['quickSelect/onClosed']({
		callback: () => {
			wireSourceIds.current = []
		},
	})

	const handleSelect = useCallback(
		async ({ entity }: Parameters<QuickSelectListProps['onSelect']>[0]) => {
			const sourceNodeIds = wireSourceIds.current
			dispatchGlobalEvent['quickSelect/requestClose']()

			const gridPos = getMindmapGridPosition({ screenX: spawnPos.current.x, screenY: spawnPos.current.y })
			if (!gridPos) {
				return
			}

			const createdNode = await createMindmapNode({
				positionX: Math.round(gridPos.x) - NODE_W / 2,
				positionY: Math.round(gridPos.y) - NODE_FALLBACK_H / 2,
				parentActorId: entity.type === 'Actor' ? entity.id : undefined,
				parentArticleId: entity.type === 'Article' ? entity.id : undefined,
				parentEventId: entity.type === 'Event' ? entity.id : undefined,
				parentTagId: entity.type === 'Tag' ? entity.id : undefined,
			})

			if (!createdNode || sourceNodeIds.length === 0) {
				return
			}

			createLinks(
				sourceNodeIds.map((sourceNodeId) => ({
					sourceNodeId,
					targetNodeId: createdNode.id,
				})),
			)
		},
		[createLinks, createMindmapNode],
	)

	return (
		<QuickSelectList
			isFocused={selectedEntityIds.length === 0}
			forceDirection="bottom"
			onSelect={handleSelect}
			inputProps={{
				autoFocus: true,
				placeholder: 'Search...',
			}}
		/>
	)
}
