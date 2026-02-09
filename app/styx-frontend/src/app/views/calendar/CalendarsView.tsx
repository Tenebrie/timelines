import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'

import { CalendarListView } from './list/CalendarListView'

export function CalendarsView() {
	return (
		<Stack width="100%" height="100%" alignItems="center">
			<Container>
				<CalendarListView />
			</Container>
		</Stack>
	)
}
