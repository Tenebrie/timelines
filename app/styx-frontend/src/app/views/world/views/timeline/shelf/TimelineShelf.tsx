import Stack from '@mui/material/Stack'

import { TracksDrawer } from './drawers/tracks/TracksDrawer'

export const TimelineShelf = () => {
	return (
		<Stack
			sx={{ position: 'absolute', width: 'calc(100% - 64px)', zIndex: 2, top: 0, pointerEvents: 'none' }}
			justifyContent="flex-start"
			flexDirection="row"
			padding={'0 32px'}
			gap={2}
		>
			<Stack sx={{ width: '100%', maxWidth: '500px' }}>
				<TracksDrawer />
			</Stack>
		</Stack>
	)
}
