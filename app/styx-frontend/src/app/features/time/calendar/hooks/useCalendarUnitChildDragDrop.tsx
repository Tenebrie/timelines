import { CalendarDraftUnitChildRelation } from '@api/types/calendarTypes'

import { useDragDrop } from '@/app/features/dragDrop/hooks/useDragDrop'
import { useDragDropReceiver } from '@/app/features/dragDrop/hooks/useDragDropReceiver'

import { CalendarUnitChildListItemGhost } from '../unitEditor/structure/childList/CalendarUnitChildListItemGhost'

type Props = {
	parentUnitId: string
	child: CalendarDraftUnitChildRelation
	index: number
	name: string
	onReorder: (fromIndex: number, toIndex: number) => void
}

export const useCalendarUnitChildDragDrop = ({ parentUnitId, child, name, index, onReorder }: Props) => {
	const { ref, ghostElement } = useDragDrop({
		type: 'calendarUnitChild',
		ghostFactory: () => <CalendarUnitChildListItemGhost name={name} child={child} index={index} />,
		params: { parentUnitId, child, index },
	})

	useDragDropReceiver({
		type: 'calendarUnitChild',
		receiverRef: ref,
		onDrop: ({ params }, event) => {
			event.markHandled()
			if (params.parentUnitId !== parentUnitId) {
				return
			}
			if (params.child.id === child.id) {
				return
			}
			onReorder(params.index, index)
		},
	})

	return {
		ref,
		ghostElement,
	}
}
