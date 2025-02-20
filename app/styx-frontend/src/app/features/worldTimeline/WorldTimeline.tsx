import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'

import { Outliner } from './components/Outliner/Outliner'
import { Timeline } from './components/Timeline/Timeline'
import { WorldStateWithDragger } from './components/WorldStateDrawer/WorldStateWithDragger'
import { WorldStateWithDraggerMirror } from './components/WorldStateDrawer/WorldStateWithDraggerMirror'
import { useWatchSelectedTime } from './hooks/useWatchSelectedTime'

export const WorldTimeline = () => {
	useWatchSelectedTime()

	return (
		<Stack direction="row" sx={{ width: '100%', height: '100%', overflowX: 'hidden' }}>
			<WorldStateWithDraggerMirror />
			<Box width={1} height={1} position="relative" overflow="auto">
				<Timeline />
				<Outliner />
			</Box>
			<WorldStateWithDragger />
		</Stack>
	)
}
