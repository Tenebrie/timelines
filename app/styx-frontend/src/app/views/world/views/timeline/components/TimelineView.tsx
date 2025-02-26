import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'

import { OutlinerDrawer } from '@/app/components/Outliner/components/OutlinerDrawer'
import { OutlinerDrawerMirrored } from '@/app/components/Outliner/components/OutlinerDrawerMirrored'
import { SelectedTimeWatcher } from '@/app/views/world/views/timeline/components/SelectedTimeWatcher'

import { Timeline } from '../Timeline'
import { TimelineShelf } from './TimelineShelf/TimelineShelf'

export const TimelineView = () => {
	return (
		<Stack direction="row" sx={{ width: '100%', height: '100%', overflowX: 'hidden' }}>
			<OutlinerDrawerMirrored />
			<Box width={1} height={1} position="relative" overflow="auto">
				<Timeline />
				<TimelineShelf />
			</Box>
			<OutlinerDrawer />
			<SelectedTimeWatcher />
		</Stack>
	)
}
