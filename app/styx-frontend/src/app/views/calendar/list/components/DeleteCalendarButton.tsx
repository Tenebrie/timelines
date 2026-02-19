import { useDeleteCalendarMutation } from '@api/calendarApi'
import { usePopupState } from 'material-ui-popup-state/hooks'

import { ConfirmPopoverButton } from '@/ui-lib/components/PopoverButton/ConfirmPopoverButton'

type Props = {
	calendarId: string
	calendarName: string
}

export function DeleteCalendarButton({ calendarId, calendarName }: Props) {
	const [deleteCalendar, { isLoading }] = useDeleteCalendarMutation()
	const popupState = usePopupState({ variant: 'popover', popupId: `delete-calendar-${calendarId}` })

	const handleDelete = async () => {
		await deleteCalendar({ calendarId })
		popupState.close()
	}

	return (
		<>
			<ConfirmPopoverButton
				type="delete"
				tooltip="Delete calendar"
				onConfirm={handleDelete}
				disabled={isLoading}
				prompt={
					<>
						Are you sure you want to delete calendar <strong>{calendarName}</strong>?
					</>
				}
			/>
		</>
	)
}
