import Stack from '@mui/material/Stack'

import { CalendarInfoOriginTime } from './CalendarInfoOriginTime'

export function CalendarInfoEditor() {
	return (
		<Stack sx={{ flex: 1, p: 2, gap: 2 }}>
			<CalendarInfoOriginTime />
		</Stack>
	)
}
