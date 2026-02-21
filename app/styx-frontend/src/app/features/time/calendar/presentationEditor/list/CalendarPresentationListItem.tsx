import { useDeleteCalendarPresentationMutation } from '@api/calendarApi'
import { CalendarDraftPresentation } from '@api/types/calendarTypes'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useSelector } from 'react-redux'

import { ConfirmPopoverButton } from '@/ui-lib/components/PopoverButton/ConfirmPopoverButton'

import { getCalendarEditorState } from '../../CalendarSliceSelectors'

type Props = {
	selected: boolean
	presentation: CalendarDraftPresentation
	onSelectPresentation: (presentationId: string | undefined) => void
}

export function CalendarPresentationListItem({ selected, presentation, onSelectPresentation }: Props) {
	const { calendar } = useSelector(getCalendarEditorState)

	const [deletePresentation] = useDeleteCalendarPresentationMutation()

	const handleDeletePresentation = async (presentationId: string) => {
		if (!calendar) return
		await deletePresentation({
			calendarId: calendar.id,
			presentationId,
		})
		if (selected) {
			onSelectPresentation(undefined)
		}
	}

	return (
		<Box key={presentation.id} sx={{ px: 0.5 }}>
			<Button
				component="div"
				onClick={() => onSelectPresentation(presentation.id)}
				sx={{
					width: '100%',
					borderRadius: 1,
					padding: '8px 16px',
					justifyContent: 'flex-start',
					textAlign: 'left',
					bgcolor: selected ? 'action.selected' : 'transparent',
					'&:has(.MuiIconButton-root:hover)': {
						bgcolor: selected ? 'action.selected' : 'transparent',
					},
					'&:hover:not(:has(.MuiIconButton-root:hover))': {
						bgcolor: selected ? 'action.selected' : 'action.hover',
					},
					transition: 'background-color 0.2s ease',
				}}
			>
				<Stack direction="row" alignItems="center" justifyContent="space-between" width="100%" gap={1}>
					<Stack flex={1} minWidth={0}>
						<Typography
							variant="body2"
							sx={{
								overflow: 'hidden',
								textOverflow: 'ellipsis',
								whiteSpace: 'nowrap',
							}}
						>
							{presentation.name}
						</Typography>
						<Typography variant="caption" color="text.secondary">
							{presentation.units.length === 0
								? 'No units'
								: `${presentation.units.length} unit${presentation.units.length === 1 ? '' : 's'}`}
						</Typography>
					</Stack>
					<ConfirmPopoverButton
						type="delete"
						prompt={
							<>
								Are you sure you want to delete <b>{presentation.name}</b> ?
							</>
						}
						tooltip="Delete presentation"
						onConfirm={() => handleDeletePresentation(presentation.id)}
					/>
				</Stack>
			</Button>
		</Box>
	)
}
