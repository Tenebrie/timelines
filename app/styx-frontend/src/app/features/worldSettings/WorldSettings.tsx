import { Paper, Stack } from '@mui/material'

import { homeRoutes, useHomeRouter } from '@/router/routes/homeRoutes'

import { ShareWorldModal } from './components/ShareWorldModal'
import { WorldDetailsEditorWrapper } from './WorldDetailsEditorWrapper'

export const WorldDetails = () => {
	const { stateOf } = useHomeRouter()
	const worldId = stateOf(homeRoutes.worldDetails).worldId

	return (
		<Stack sx={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
			<Paper>
				<WorldDetailsEditorWrapper worldId={worldId} key={worldId} />
			</Paper>
			<ShareWorldModal />
		</Stack>
	)
}
