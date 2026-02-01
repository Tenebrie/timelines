import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'

import { CalendarTimestampPreview } from '../preview/components/CalendarTimestampPreview'

export function CalendarHeader() {
	return (
		<Stack direction="row">
			<Box sx={{ flex: 1 }}>
				<TextField
					label="Calendar"
					size="small"
					value={''}
					// onChange={(e) => onUpdateUnit({ name: e.target.value })}
					sx={{ flex: 1 }}
				/>
			</Box>
			<Box sx={{ flex: 1 }}>
				<CalendarTimestampPreview />
			</Box>
		</Stack>
	)
}
