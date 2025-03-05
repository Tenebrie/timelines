import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'

import { OutlinerDrawer } from '../../components/OutlinerDrawer'
import { Mindmap } from './Mindmap'
import { MindmapShelf } from './shelf/MindmapShelf'

export const MindmapView = () => {
	return (
		<Stack direction="row" sx={{ width: '100%', height: '100%', overflowX: 'hidden' }}>
			<Box width={1} height={1} position="relative" overflow="auto">
				<Mindmap />
				<MindmapShelf />
			</Box>
			<OutlinerDrawer />
		</Stack>
	)
}
