import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'

import { OutlinerDrawer } from '@/app/views/world/components/OutlinerDrawer'
import { SelectedTimeWatcher } from '@/app/views/world/views/timeline/components/SelectedTimeWatcher'

import { TimelineOverview } from './overview/TimelineOverview'
import { TimelineShelf } from './shelf/TimelineShelf'
import { Timeline } from './Timeline'

export function TimelineView() {
	return (
		<Stack direction="row" sx={{ width: '100%', height: '100%', overflowX: 'hidden' }}>
			<Box width={1} height={1} position="relative" overflow="auto">
				<Timeline />
				<TimelineShelf />
				<TimelineOverview />
			</Box>
			<OutlinerDrawer />
			<SelectedTimeWatcher />
		</Stack>
	)
}
