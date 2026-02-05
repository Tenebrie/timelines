import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import { memo } from 'react'

import { CalendarTimestampForm } from '../unitEditor/preview/components/CalendarTimestampForm'
import { CalendarTimestampPreview } from '../unitEditor/preview/components/CalendarTimestampPreview'
import { CalendarTitle } from './CalendarTitle'

type Props = {
	onExit: () => void
}

export const CalendarHeader = memo(CalendarHeaderComponent)

function CalendarHeaderComponent({ onExit }: Props) {
	return (
		<Stack gap={1}>
			<CalendarTitle onClose={onExit} />
			<Divider />
			<Stack direction="row" gap={2} sx={{ padding: 1 }}>
				<Box sx={{ flex: 1 }}>
					<Stack>
						<CalendarTimestampForm />
					</Stack>
				</Box>
				<Box sx={{ flex: 1 }}>
					<CalendarTimestampPreview />
				</Box>
			</Stack>
		</Stack>
	)
}
