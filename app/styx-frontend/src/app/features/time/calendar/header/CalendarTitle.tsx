import { useUpdateCalendarMutation } from '@api/calendarApi'
import Button from '@mui/material/Button'
import Input from '@mui/material/Input'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import useEvent from 'react-use-event-hook'

import { Shortcut, useShortcut } from '@/app/hooks/useShortcut/useShortcut'

import { getCalendarEditorState } from '../CalendarSliceSelectors'

export const CalendarTitle = () => {
	const { calendar } = useSelector(getCalendarEditorState)
	const [editCalendar] = useUpdateCalendarMutation()

	const [editing, setEditing] = useState(false)
	const [name, setName] = useState(calendar?.name)

	const applyChanges = useEvent(() => {
		setEditing(false)
		if (!calendar || name === calendar.name || !name?.trim()) {
			return
		}
		editCalendar({
			calendarId: calendar.id,
			body: { name },
		})
	})

	useShortcut([Shortcut.Enter, Shortcut.CtrlEnter], applyChanges, editing)
	useShortcut(
		[Shortcut.Escape],
		() => {
			setEditing(false)
			setName(calendar!.name)
		},
		editing,
	)

	useEffect(() => {
		setEditing(false)
	}, [calendar])

	if (!calendar) {
		return null
	}

	const onStartEdit = () => {
		setEditing(true)
		setName(calendar.name)
	}

	return (
		<Stack
			gap={1}
			direction="row"
			alignContent="center"
			width="100%"
			sx={{ height: '32px' }}
			data-testid="CalendarEditorTitle"
		>
			{!editing && (
				<Stack direction="row" justifyContent="space-between" width="100%">
					<Button
						variant="text"
						sx={{ padding: '0 8px', width: '100%', justifyContent: 'flex-start' }}
						onClick={onStartEdit}
					>
						<Typography variant="h6" noWrap>
							{calendar.name}
						</Typography>
					</Button>
				</Stack>
			)}
			{editing && (
				<Input
					autoFocus
					value={name}
					onChange={(event) => setName(event.target.value)}
					onBlur={() => applyChanges()}
					role="textbox"
					sx={{
						width: '100%',
						marginBottom: '-9px',
						fontSize: '20px',
						fontWeight: 450,
						paddingLeft: '8px',
						paddingBottom: '8px',
					}}
				/>
			)}
		</Stack>
	)
}
