import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import { useParams } from '@tanstack/react-router'

import { ShareWorldModal } from './components/ShareWorldModal'
import { WorldDetailsEditorWrapper } from './WorldDetailsEditorWrapper'

export const WorldDetails = () => {
	const { worldId } = useParams({ from: '/world/$worldId/_world/settings' })

	return (
		<Stack sx={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
			<Paper>
				<WorldDetailsEditorWrapper worldId={worldId} key={worldId} />
			</Paper>
			<ShareWorldModal />
		</Stack>
	)
}
