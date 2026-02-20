import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'

import { CalendarList } from './list/CalendarList'

export function CalendarsView() {
	return (
		<Stack width="100%" height="100%" alignItems="center">
			<Container>
				<CalendarList />
			</Container>
		</Stack>
	)
}
