import { ArrowForward, Close, ZoomIn, ZoomOut } from '@mui/icons-material'
import { Button, Divider, IconButton, Stack } from '@mui/material'
import { memo } from 'react'

import { useWorldRouter } from '../../../../../../../router/routes/worldRoutes'
import { useEventBusDispatch } from '../../../../../eventBus'
import { useWorldTime } from '../../../../../time/hooks/useWorldTime'
import { TimelineEdgeScroll } from '../TimelineEdgeScroll/TimelineEdgeScroll'

type Props = {
	onNavigateToTime: (timestamp: number) => void
	onZoomIn: () => void
	onZoomOut: () => void
}

const TimelineControlsComponent = ({ onNavigateToTime, onZoomIn, onZoomOut }: Props) => {
	const { selectedTimeOrNull, navigateToOutliner, navigateToCurrentWorldRoot } = useWorldRouter()
	const { timeToLabel } = useWorldTime()
	const scrollTimelineLeft = useEventBusDispatch({ event: 'scrollTimelineLeft' })
	const scrollTimelineRight = useEventBusDispatch({ event: 'scrollTimelineRight' })

	if (selectedTimeOrNull === null) {
		return <></>
	}

	return (
		<div
			style={{
				position: 'relative',
				width: 'calc(100%)',
			}}
		>
			<Stack direction="row" justifyContent="space-between" width="calc(100%-64px)">
				<Stack direction="row" gap={0.5}>
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
					<IconButton color="secondary" onClick={() => onNavigateToTime(selectedTimeOrNull)}>
						<ArrowForward />
					</IconButton>
					<IconButton color="secondary" onClick={() => navigateToCurrentWorldRoot()}>
						<Close />
					</IconButton>
				</Stack>
				<Stack direction="row" gap={0.5}>
					<Button variant="outlined" color="secondary" onClick={onZoomOut}>
						<ZoomOut />
					</Button>
					<Button variant="outlined" color="secondary" onClick={onZoomIn}>
						<ZoomIn />
					</Button>
				</Stack>
			</Stack>
			<Divider sx={{ position: 'absolute', bottom: 0, width: '100%' }} />
			<TimelineEdgeScroll side="left" onClick={scrollTimelineLeft} />
			<TimelineEdgeScroll side="right" onClick={scrollTimelineRight} />
		</div>
	)
}

export const TimelineControls = memo(TimelineControlsComponent)
