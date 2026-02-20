import { useCreateCalendarPresentationMutation } from '@api/calendarApi'
import { CalendarDraftPresentation } from '@api/types/calendarTypes'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useState } from 'react'
import { useSelector } from 'react-redux'

import { CreatePopoverButton } from '@/ui-lib/components/PopoverButton/CreatePopoverButton'

import { getCalendarEditorState } from '../../CalendarSliceSelectors'
import { CalendarPresentationListItem } from './CalendarPresentationListItem'

type Props = {
	selectedPresentation: CalendarDraftPresentation | null
	onSelectPresentation: (presentationId: string | undefined) => void
}

export function CalendarPresentationList({ selectedPresentation, onSelectPresentation }: Props) {
	const { calendar } = useSelector(getCalendarEditorState, (a, b) => a.calendar === b.calendar)
	const [newPresentationName, setNewPresentationName] = useState('')

	const [createPresentation] = useCreateCalendarPresentationMutation()

	const onCreatePresentation = async () => {
		if (!newPresentationName.trim() || !calendar) {
			return
		}

		await createPresentation({
			calendarId: calendar.id,
			body: {
				name: newPresentationName.trim(),
			},
		})
		setNewPresentationName('')
	}

	// Sort presentations by smallest unit duration (biggest at top)
	const sortedPresentations = [...(calendar?.presentations ?? [])].sort((a, b) => {
		return a.scaleFactor - b.scaleFactor
	})

	if (!calendar) {
		return null
	}

	return (
		<Box
			sx={{
				width: 240,
				minWidth: 240,
				display: 'flex',
				flexDirection: 'column',
				borderColor: 'divider',
				position: 'sticky',
				top: 0,
				alignSelf: 'flex-start',
			}}
		>
			<Stack sx={{ px: 2, py: 1.5 }} direction="row" alignItems="center" justifyContent="space-between">
				<Typography variant="body2" color="text.secondary" fontWeight="medium">
					Levels
				</Typography>

				<CreatePopoverButton
					size="small"
					tooltip="Add level"
					onConfirm={onCreatePresentation}
					confirmDisabled={!newPresentationName.trim()}
					popoverBody={({ close }) => (
						<>
							<Typography variant="subtitle2" fontWeight="bold">
								New Presentation Level
							</Typography>
							<TextField
								size="small"
								placeholder="Name"
								value={newPresentationName}
								onChange={(e) => setNewPresentationName(e.target.value)}
								onKeyDown={(e) => {
									if (e.key !== 'Enter') {
										return
									}
									onCreatePresentation()
									close()
								}}
								fullWidth
							/>
						</>
					)}
				/>
			</Stack>

			<Divider />

			<Stack gap={1} sx={{ flex: 1, overflow: 'auto', py: 1 }}>
				{sortedPresentations.length === 0 && (
					<Typography variant="body2" color="text.secondary" sx={{ px: 2, py: 2, textAlign: 'center' }}>
						No layers created yet.
						<br />
						Click + to add one.
					</Typography>
				)}
				{sortedPresentations.map((presentation) => (
					<CalendarPresentationListItem
						key={presentation.id}
						presentation={presentation}
						selected={selectedPresentation?.id === presentation.id}
						onSelectPresentation={onSelectPresentation}
					/>
				))}
			</Stack>
		</Box>
	)
}
