import { useSearch } from '@tanstack/react-router'
import { useCallback, useRef } from 'react'

import { QuickSelectList, QuickSelectListProps } from '@/app/components/QuickSelectList/QuickSelectList'
import { dispatchGlobalEvent, useEventBusSubscribe } from '@/app/features/eventBus'
import { useMousePositionRef } from '@/app/hooks/useMousePositionRef'
import { Shortcut, useShortcut } from '@/app/hooks/useShortcut/useShortcut'

import { useCreateMindmapNode } from '../api/useCreateMindmapNode'
import { getMindmapGridPosition } from '../utils/getMindmapGridPosition'

export function MindmapQuickSelect() {
	const selectedEntityIds = useSearch({
		from: '/world/$worldId/_world',
		select: (search) => search.navi,
	})

	const mousePos = useMousePositionRef()
	const [createMindmapNode] = useCreateMindmapNode()

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

	const handleSelect = useCallback(
		({ entity }: Parameters<QuickSelectListProps['onSelect']>[0]) => {
			dispatchGlobalEvent['quickSelect/requestClose']()

			const gridPos = getMindmapGridPosition({ screenX: spawnPos.current.x, screenY: spawnPos.current.y })
			if (!gridPos) {
				return
			}

			createMindmapNode({
				positionX: Math.round(gridPos.x),
				positionY: Math.round(gridPos.y),
				parentActorId: entity.type === 'Actor' ? entity.id : undefined,
				parentArticleId: entity.type === 'Article' ? entity.id : undefined,
				parentEventId: entity.type === 'Event' ? entity.id : undefined,
				parentTagId: entity.type === 'Tag' ? entity.id : undefined,
			})
		},
		[createMindmapNode],
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
