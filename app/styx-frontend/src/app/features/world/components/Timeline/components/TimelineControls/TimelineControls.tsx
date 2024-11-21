import { ZoomIn, ZoomOut } from '@mui/icons-material'
import { Button, Paper, Slider, Stack } from '@mui/material'
import { memo } from 'react'

import { useEventBusDispatch } from '@/app/features/eventBus'
import { useWorldTime } from '@/app/features/time/hooks/useWorldTime'
import { useTimelineSpacingSlider } from '@/app/features/world/components/Outliner/components/OutlinerControls/useTimelineSpacingSlider'
import { useCustomTheme } from '@/hooks/useCustomTheme'
import { useWorldRouter } from '@/router/routes/worldRoutes'

import { TimelineEdgeScroll } from '../TimelineEdgeScroll/TimelineEdgeScroll'
import { EventTracksMenu } from './EventTracksMenu/EventTracksMenu'

type Props = {
	containerRef: React.MutableRefObject<HTMLDivElement | null>
	onNavigateToTime: (timestamp: number) => void
	onZoomIn: () => void
	onZoomOut: () => void
}

const TimelineControlsComponent = ({ containerRef, onNavigateToTime, onZoomIn, onZoomOut }: Props) => {
	const theme = useCustomTheme()
	const { selectedTimeOrNull, navigateToOutliner } = useWorldRouter()
	const { timeToLabel } = useWorldTime()
	const { timelineSpacing, setTimelineSpacing } = useTimelineSpacingSlider({ containerRef })
	const scrollTimelineLeft = useEventBusDispatch({ event: 'scrollTimelineLeft' })
	const scrollTimelineRight = useEventBusDispatch({ event: 'scrollTimelineRight' })

	if (selectedTimeOrNull === null) {
		return <></>
	}

	return (
		<Paper elevation={2} sx={{ backgroundColor: theme.custom.palette.background.timelineHeader }}>
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
								onNavigateToTime(selectedTimeOrNull)
								navigateToOutliner(selectedTimeOrNull)
							}}
						>
							{timeToLabel(selectedTimeOrNull)}
						</Button>
					</Stack>
					<Stack direction="row" gap={0.5} alignItems="center">
						<Stack width={100} marginRight={2}>
							<Slider
								sx={{
									height: 6,
								}}
								aria-label="Spacing"
								getAriaValueText={() => `Spacing = ${timelineSpacing}`}
								valueLabelDisplay="auto"
								step={0.1}
								value={timelineSpacing}
								min={0.5}
								max={4}
								onChange={(_, value) => setTimelineSpacing(value)}
							/>
						</Stack>
						<Button variant="outlined" color="secondary" onClick={onZoomOut}>
							<ZoomOut />
						</Button>
						<Button variant="outlined" color="secondary" onClick={onZoomIn}>
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
