import { useDeleteCalendarMutation } from '@api/calendarApi'
import Delete from '@mui/icons-material/Delete'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Popover from '@mui/material/Popover'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { bindPopover, bindTrigger, usePopupState } from 'material-ui-popup-state/hooks'

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
			<Tooltip title="Delete calendar" disableInteractive enterDelay={500}>
				<IconButton
					size="small"
					aria-label="Delete calendar button"
					{...bindTrigger(popupState)}
					onMouseDown={(e) => e.stopPropagation()}
					onClick={(e) => {
						e.stopPropagation()
						bindTrigger(popupState).onClick(e)
					}}
				>
					<Delete fontSize="small" />
				</IconButton>
			</Tooltip>
			<Popover
				{...bindPopover(popupState)}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
				transformOrigin={{ horizontal: 'right', vertical: 'top' }}
				onClick={(e) => e.stopPropagation()}
			>
				<Stack spacing={1.5} sx={{ p: 2, maxWidth: 280 }}>
					<Typography variant="body2">
						Are you sure you want to delete <strong>{calendarName}</strong>?
					</Typography>
					<Stack direction="row" spacing={1} justifyContent="flex-end">
						<Button size="small" onClick={() => popupState.close()}>
							Cancel
						</Button>
						<Button
							size="small"
							variant="contained"
							color="error"
							onClick={handleDelete}
							disabled={isLoading}
						>
							Delete
						</Button>
					</Stack>
				</Stack>
			</Popover>
		</>
	)
}
