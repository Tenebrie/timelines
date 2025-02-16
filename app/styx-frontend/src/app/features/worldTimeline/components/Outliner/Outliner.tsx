import Stack from '@mui/material/Stack'

import { EntityDrawer } from '../EntityDrawer/EntityDrawer'

export const Outliner = () => {
	return (
		<Stack
			sx={{ position: 'absolute', width: 'calc(100% - 16px)', zIndex: 2, top: 0, pointerEvents: 'none' }}
			justifyContent="flex-start"
			flexDirection="row"
			padding={'0 8px'}
			gap={2}
		>
			<Stack sx={{ width: '100%', maxWidth: '600px' }}>
				<EntityDrawer />
			</Stack>
		</Stack>
	)
}
