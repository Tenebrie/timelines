import { useUpdateCalendarUnitMutation } from '@api/calendarApi'
import { CalendarDraftUnit } from '@api/types/calendarTypes'
import CloseIcon from '@mui/icons-material/Close'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import { useDispatch, useSelector } from 'react-redux'
import useEvent from 'react-use-event-hook'

import { EditableTitle } from '@/ui-lib/components/EditableTitle/EditableTitle'

import { calendarEditorSlice } from '../../CalendarSlice'
import { getCalendarEditorState } from '../../CalendarSliceSelectors'

type Props = {
	unit: CalendarDraftUnit
	onClose: () => void
}

export const CalendarUnitTitle = ({ unit, onClose }: Props) => {
	const { calendar } = useSelector(getCalendarEditorState)
	const [editCalendarUnit] = useUpdateCalendarUnitMutation()

	const { updateUnit } = calendarEditorSlice.actions
	const dispatch = useDispatch()

	const onSave = useEvent((name: string) => {
		if (!calendar || name === unit.name || !name?.trim()) {
			return
		}
		dispatch(updateUnit({ unitId: unit.id, delta: { name } }))
		editCalendarUnit({
			calendarId: calendar.id,
			unitId: unit.id,
			body: { name },
		})
	})

	return (
		<EditableTitle
			startAdornment={
				<Tooltip title="Close" disableInteractive enterDelay={400}>
					<IconButton
						size="small"
						onClick={onClose}
						edge="start"
						sx={{
							padding: '6px',
						}}
					>
						<CloseIcon fontSize="small" />
					</IconButton>
				</Tooltip>
			}
			value={unit.name}
			onSave={onSave}
			data-testid="CalendarUnitTitle"
		/>
	)
}
