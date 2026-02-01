import ArrowBack from '@mui/icons-material/ArrowBack'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'

import { CalendarTimestampForm } from '../preview/components/CalendarTimestampForm'
import { CalendarTimestampPreview } from '../preview/components/CalendarTimestampPreview'
import { CalendarTitle } from './CalendarTitle'

type Props = {
	onExit: () => void
}

export function CalendarHeader({ onExit }: Props) {
	return (
		<Stack gap={1}>
			<Stack direction="row" alignItems="center" gap={1}>
				{onExit && (
					<Tooltip title="Back to calendars" disableInteractive>
						<IconButton
							size="small"
							onClick={() => onExit()}
							edge="start"
							sx={{
								padding: '6px',
							}}
						>
							<ArrowBack fontSize="small" />
						</IconButton>
					</Tooltip>
				)}
				<Divider orientation="vertical" sx={{ height: 24 }} />
				<CalendarTitle />
			</Stack>
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
