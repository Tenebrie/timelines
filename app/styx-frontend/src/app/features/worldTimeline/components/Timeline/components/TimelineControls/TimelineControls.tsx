import ZoomIn from '@mui/icons-material/ZoomIn'
import ZoomOut from '@mui/icons-material/ZoomOut'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import { memo } from 'react'
import { useSelector } from 'react-redux'

import { useEventBusDispatch } from '@/app/features/eventBus'
import { useWorldTime } from '@/app/features/time/hooks/useWorldTime'
import { getWorldState } from '@/app/features/worldTimeline/selectors'
import { useCustomTheme } from '@/hooks/useCustomTheme'

import { TimelineEdgeScroll } from '../TimelineEdgeScroll/TimelineEdgeScroll'
import { EventTracksMenu } from './EventTracksMenu/EventTracksMenu'

type Props = {
	onNavigateToTime: (timestamp: number) => void
	onZoomIn: () => void
	onZoomOut: () => void
}

const TimelineControlsComponent = ({ onNavigateToTime, onZoomIn, onZoomOut }: Props) => {
	const theme = useCustomTheme()
	const { selectedTime } = useSelector(getWorldState, (a, b) => a.selectedTime === b.selectedTime)
	const { timeToLabel } = useWorldTime()
	const scrollTimelineLeft = useEventBusDispatch({ event: 'scrollTimelineLeft' })
	const scrollTimelineRight = useEventBusDispatch({ event: 'scrollTimelineRight' })

	return (
		<Paper
			elevation={2}
			sx={{ backgroundColor: theme.custom.palette.background.timelineHeader, minWidth: '700px' }}
		>
			<div
				className="block-timeline"
				style={{
					position: 'relative',
					width: 'calc(100%-64px)',
					padding: '4px 32px',
				}}
			>
				<Stack direction="row" justifyContent="space-between" width="calc(100%-64px)">
					<Stack direction="row" gap={2} marginLeft={1}>
						<EventTracksMenu onNavigateToTime={onNavigateToTime} />
						<Button
							color="secondary"
							variant="outlined"
							onClick={() => {
								onNavigateToTime(selectedTime)
							}}
						>
							{timeToLabel(selectedTime)}
						</Button>
					</Stack>
					<Stack direction="row" gap={0.5} alignItems="center">
						<Button variant="outlined" color="secondary" onClick={onZoomOut} aria-label="Zoom out">
							<ZoomOut />
						</Button>
						<Button variant="outlined" color="secondary" onClick={onZoomIn} aria-label="Zoom in">
							<ZoomIn />
						</Button>
					</Stack>
				</Stack>
				<TimelineEdgeScroll side="left" onClick={scrollTimelineLeft} />
				<TimelineEdgeScroll side="right" onClick={scrollTimelineRight} />
			</div>
		</Paper>
	)
}

export const TimelineControls = memo(TimelineControlsComponent)
