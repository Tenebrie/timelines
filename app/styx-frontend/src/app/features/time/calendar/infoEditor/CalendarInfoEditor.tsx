import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'

import { CalendarInfoOriginTime } from './CalendarInfoOriginTime'
import { CalendarInfoPreview } from './CalendarInfoPreview'

export function CalendarInfoEditor() {
	return (
		<Stack sx={{ flex: 1, p: 2, gap: 2 }}>
			<CalendarInfoOriginTime />
			<Stack>
				<Divider />
				<CalendarInfoPreview />
			</Stack>
		</Stack>
	)
}
