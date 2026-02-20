import { useDeleteCalendarUnitMutation } from '@api/calendarApi'
import { useSelector } from 'react-redux'

import { ConfirmPopoverButton } from '@/ui-lib/components/PopoverButton/ConfirmPopoverButton'

import { getCalendarEditorState } from '../../CalendarSliceSelectors'

type Props = {
	unitId: string
	unitName: string
}

export function DeleteUnitButton({ unitId, unitName }: Props) {
	const { calendar } = useSelector(getCalendarEditorState)
	const [deleteUnit] = useDeleteCalendarUnitMutation()

	const handleDelete = async () => {
		if (!calendar) {
			return
		}

		await deleteUnit({
			calendarId: calendar.id,
			unitId,
		})
	}

	return (
		<ConfirmPopoverButton
			type="delete"
			prompt={
				<>
					Are you sure you want to delete <b>{unitName}</b> ?
				</>
			}
			tooltip="Delete unit"
			onConfirm={handleDelete}
		/>
	)
}
