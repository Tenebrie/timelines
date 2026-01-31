import { CalendarDraftUnit } from '@api/types/calendarTypes'
import Divider from '@mui/material/Divider'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'

import { CalendarTimestampPreview } from './components/CalendarTimestampPreview'
import { CalendarUnitPreviewDuration } from './components/CalendarUnitPreviewDuration'
import { CalendarUnitPreviewTree } from './components/CalendarUnitPreviewTree'

type Props = {
	unit: CalendarDraftUnit
}

export function CalendarUnitPreview({ unit }: Props) {
	return (
		<>
			<Stack gap={2}>
				<CalendarTimestampPreview />
				<Paper
					variant="outlined"
					sx={{ p: '12px', width: 'calc(100% - 24px)', bgcolor: 'background.default' }}
				>
					<Stack gap={2}>
						<CalendarUnitPreviewDuration unit={unit} />
						<Divider />
						<CalendarUnitPreviewTree unit={unit} />
					</Stack>
				</Paper>
			</Stack>
		</>
	)
}
