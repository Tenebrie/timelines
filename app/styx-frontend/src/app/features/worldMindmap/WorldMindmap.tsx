import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'

import { WorldStateWithDragger } from '../worldTimeline/components/WorldStateDrawer/WorldStateWithDragger'
import { Mindmap } from './Mindmap'
import { MindmapBookshelf } from './MindmapBookshelf'

export const WorldMindmap = () => {
	return (
		<Stack direction="row" sx={{ width: '100%', height: '100%', overflowX: 'hidden' }}>
			<Box width={1} height={1} position="relative" overflow="auto">
				<Mindmap />
				<MindmapBookshelf />
			</Box>
			<WorldStateWithDragger />
		</Stack>
	)
}
