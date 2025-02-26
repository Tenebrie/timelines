import Stack from '@mui/material/Stack'

import { ActorDrawer } from './ActorDrawer/ActorDrawer'

export function MindmapShelf() {
	return (
		<Stack
			sx={{ position: 'absolute', width: 'calc(100% - 32px)', zIndex: 2, top: 0, pointerEvents: 'none' }}
			justifyContent="flex-start"
			flexDirection="row"
			padding={'0 16px'}
			gap={2}
		>
			<Stack sx={{ width: '100%', maxWidth: '600px' }}>
				<ActorDrawer />
			</Stack>
		</Stack>
	)
}
