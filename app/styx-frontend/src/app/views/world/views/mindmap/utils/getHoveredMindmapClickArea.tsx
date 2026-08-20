import { DragDropState } from '@/app/features/dragDrop/DragDropState'

export function getHoveredMindmapClickArea() {
	const state = DragDropState.current
	if (!state) {
		return false
	}
	return state.hovered.find((element) => element.hasAttribute('data-mindmap-click-area'))
}
