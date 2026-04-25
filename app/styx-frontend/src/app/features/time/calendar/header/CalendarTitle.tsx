import { useUpdateCalendarMutation } from '@api/calendarApi'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import { useSelector } from 'react-redux'
import useEvent from 'react-use-event-hook'

import { EditableTitle } from '@/ui-lib/components/EditableTitle/EditableTitle'

import { getCalendarEditorState } from '../CalendarSliceSelectors'

type Props = {
	onClose: () => void
}

export const CalendarTitle = ({ onClose }: Props) => {
	const { calendar } = useSelector(getCalendarEditorState)
	const [editCalendar] = useUpdateCalendarMutation()

	const onSave = useEvent((name: string) => {
		if (!calendar || name === calendar.name || !name?.trim()) {
			return
		}
		editCalendar({
			calendarId: calendar.id,
			body: { name },
		})
	})

	if (!calendar) {
		return null
	}

	return (
		<EditableTitle
			startAdornment={
				<Stack direction="row" gap={0.5} marginRight={0.5} alignItems="center">
					<Tooltip title="Back to calendars" disableInteractive enterDelay={400}>
						<IconButton
							size="small"
							onClick={onClose}
							edge="start"
							sx={{
								padding: '6px',
							}}
						>
							<ArrowBackIcon fontSize="small" />
						</IconButton>
					</Tooltip>
					<Divider orientation="vertical" sx={{ height: 24 }} />
				</Stack>
			}
			value={calendar.name}
			onSave={onSave}
			data-testid="CalendarEditorTitle"
		/>
	)
}
