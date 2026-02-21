import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useSearch } from '@tanstack/react-router'
import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import useEvent from 'react-use-event-hook'

import { useStableNavigate } from '@/router-utils/hooks/useStableNavigate'

import { getCalendarEditorState } from '../CalendarSliceSelectors'
import { CalendarPresentationEditorPanel } from './editor/CalendarPresentationEditorPanel'
import { CalendarPresentationList } from './list/CalendarPresentationList'

export function CalendarPresentationEditor() {
	const { calendar } = useSelector(getCalendarEditorState)
	const { presentation: selectedPresentationId } = useSearch({ from: '/calendar/$calendarId' })

	const selectedPresentation = useMemo(
		() => calendar?.presentations.find((p) => p.id === selectedPresentationId) ?? null,
		[calendar, selectedPresentationId],
	)

	const navigate = useStableNavigate({ from: '/calendar/$calendarId' })
	const onSelectPresentation = useEvent((presentationId: string | undefined) => {
		navigate({ search: (prev) => ({ ...prev, presentation: presentationId }) })
	})

	if (!calendar) {
		return null
	}

	return (
		<Stack direction="row" sx={{ flex: 1, alignItems: 'stretch' }}>
			<CalendarPresentationList
				selectedPresentation={selectedPresentation}
				onSelectPresentation={onSelectPresentation}
			/>
			<Stack sx={{ flex: 1 }}>
				<Stack sx={{ p: '8px' }}>
					<Paper variant="outlined" sx={{ p: '12px 8px' }}>
						{selectedPresentation ? (
							<CalendarPresentationEditorPanel presentation={selectedPresentation} />
						) : (
							<PresentationEmptyState hasPresentations={(calendar.presentations.length ?? 0) > 0} />
						)}
					</Paper>
				</Stack>
			</Stack>
		</Stack>
	)
}

function PresentationEmptyState({ hasPresentations }: { hasPresentations: boolean }) {
	return (
		<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
			<Typography color="text.secondary">
				{hasPresentations
					? 'Select a zoom level from the sidebar to edit'
					: 'Create a zoom level to get started'}
			</Typography>
		</Box>
	)
}
