import { useCreateCalendarMutation } from '@api/calendarApi'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useCallback, useState } from 'react'

import { CalendarSelector } from '@/app/features/time/calendar/components/CalendarSelector'
import { CreatePopoverButton } from '@/ui-lib/components/PopoverButton/CreatePopoverButton'

export function CalendarListCreateNewButton() {
	const [newCalendarName, setNewCalendarName] = useState('')
	const [selectedTemplate, setSelectedTemplate] = useState<string | undefined>()

	const [createCalendar, { isLoading: isCreating }] = useCreateCalendarMutation()

	const handleCreateCalendar = useCallback(async () => {
		if (!newCalendarName.trim()) {
			return
		}

		const result = await createCalendar({
			body: { name: newCalendarName.trim(), templateId: selectedTemplate },
		})
		if ('data' in result && result.data) {
			setNewCalendarName('')
		}
	}, [newCalendarName, createCalendar, selectedTemplate])

	return (
		<CreatePopoverButton
			tooltip="Create new calendar"
			onConfirm={handleCreateCalendar}
			confirmDisabled={!newCalendarName.trim() || isCreating}
			popoverSx={{
				minWidth: 300,
			}}
			popoverBody={({ close }) => (
				<>
					<Typography variant="subtitle2" fontWeight="bold">
						New Calendar
					</Typography>
					<TextField
						label="Name"
						size="small"
						value={newCalendarName}
						onChange={(e) => setNewCalendarName(e.target.value)}
						onKeyDown={(e) => {
							if (e.key !== 'Enter') {
								return
							}
							handleCreateCalendar()
							close()
						}}
						autoFocus
						fullWidth
						disabled={isCreating}
					/>
					<CalendarSelector
						label="Template to copy"
						value={selectedTemplate}
						onChange={setSelectedTemplate}
						allowEmpty
					/>
				</>
			)}
		/>
	)
}
