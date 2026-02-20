import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useSelector } from 'react-redux'

import { getCalendarEditorState } from '../CalendarSliceSelectors'

export function CalendarIntervalsEditor() {
	const { calendar } = useSelector(getCalendarEditorState)

	if (!calendar) {
		return null
	}

	return (
		<Stack sx={{ flex: 1, p: 2, gap: 2 }}>
			<Paper variant="outlined" sx={{ p: 3 }}>
				<Typography variant="h6" gutterBottom>
					Calendar Intervals
				</Typography>
			</Paper>
		</Stack>
	)
}
