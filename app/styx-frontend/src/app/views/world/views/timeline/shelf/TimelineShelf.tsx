import Stack from '@mui/material/Stack'

import { EventDrawer } from './drawers/event/EventDrawer'
import { TracksDrawer } from './drawers/tracks/TracksDrawer'

export const TimelineShelf = () => {
	return (
		<Stack
			sx={{ position: 'absolute', width: 'calc(100% - 32px)', zIndex: 2, top: 0, pointerEvents: 'none' }}
			justifyContent="flex-start"
			flexDirection="row"
			padding={'0 16px'}
			gap={2}
		>
			<Stack sx={{ width: '100%', maxWidth: '500px' }}>
				<TracksDrawer />
			</Stack>
			<Stack sx={{ width: '100%', maxWidth: '1000px' }}>
				<EventDrawer />
			</Stack>
		</Stack>
	)
}
