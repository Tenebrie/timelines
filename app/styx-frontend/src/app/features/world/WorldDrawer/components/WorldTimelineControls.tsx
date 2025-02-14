import ZoomIn from '@mui/icons-material/ZoomIn'
import ZoomOut from '@mui/icons-material/ZoomOut'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'

import { useEventBusDispatch } from '@/app/features/eventBus'
import { EventTracksMenu } from '@/app/features/worldTimeline/components/Timeline/components/TimelineControls/EventTracksMenu/EventTracksMenu'

export const WorldTimelineControls = () => {
	const requestZoom = useEventBusDispatch({ event: 'timeline/requestZoom' })

	return (
		<Stack>
			<Divider />
			<Paper
				sx={{
					display: 'flex',
					flexDirection: 'column',
					gap: 1,
					marginTop: 1,
				}}
				elevation={5}
			>
				<EventTracksMenu size="small" />

				<Button
					color="primary"
					onClick={() => requestZoom({ direction: 'in' })}
					aria-label="Zoom in"
					sx={{ height: 64 }}
				>
					<ZoomIn />
				</Button>
				<Button
					color="primary"
					onClick={() => requestZoom({ direction: 'out' })}
					aria-label="Zoom out"
					sx={{ height: 64 }}
				>
					<ZoomOut />
				</Button>
			</Paper>
		</Stack>
	)
}
