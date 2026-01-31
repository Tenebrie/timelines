import { CalendarDraftUnit } from '@api/types/calendarTypes'

import { useDragDrop } from '@/app/features/dragDrop/hooks/useDragDrop'
import { useDragDropReceiver } from '@/app/features/dragDrop/hooks/useDragDropReceiver'

import { CalendarUnitListItem } from '../unitList/CalendarUnitListItem'
import { useMoveCalendarUnit } from './useMoveCalendarUnit'

type Props = {
	unit: CalendarDraftUnit
}

export const useCalendarUnitDragDrop = ({ unit }: Props) => {
	const [moveCalendarUnit] = useMoveCalendarUnit()

	// const { uncollapseWikiFolder } = preferencesSlice.actions
	// const dispatch = useDispatch()
	// const forceOpen = useCallback(() => {
	// 	dispatch(uncollapseWikiFolder(article))
	// }, [dispatch, uncollapseWikiFolder, article])

	// const icon = useMemo(() => (article.children?.length ? <Folder /> : <Article />), [article.children])

	const { ref, ghostElement } = useDragDrop({
		type: 'calendarUnit',
		ghostFactory: () => <CalendarUnitListItem unit={unit} selectedUnit={null} onSelectUnit={() => {}} />,
		params: { unit },
	})

	useDragDropReceiver({
		type: 'calendarUnit',
		receiverRef: ref,
		onDrop: ({ params }, event) => {
			event.markHandled()
			if (params.unit.id === unit.id) {
				return
			}
			const diff = params.unit.position < unit.position ? 1 : -1
			moveCalendarUnit({
				id: params.unit.id,
				position: unit.position + diff,
			})
		},
	})

	return {
		ref,
		ghostElement,
	}
}
