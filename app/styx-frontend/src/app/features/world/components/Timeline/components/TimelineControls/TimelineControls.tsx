import { ExpandMore, ZoomIn, ZoomOut } from '@mui/icons-material'
import { Button, Divider, Stack } from '@mui/material'
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
	const { selectedTimeOrNull, navigateToOutliner } = useWorldRouter()
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
				width: 'calc(100% - 64px)',
				padding: '4px 32px',
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
			<Divider sx={{ position: 'absolute', left: 0, bottom: 0, width: '100%' }} />
			<div
				style={{
					position: 'absolute',
					left: 'calc(50% - 13px)',
					bottom: '18px',
					width: '100%',
					height: 1,
				}}
			>
				<ExpandMore />
			</div>
			<TimelineEdgeScroll side="left" onClick={scrollTimelineLeft} />
			<TimelineEdgeScroll side="right" onClick={scrollTimelineRight} />
		</div>
	)
}

export const TimelineControls = memo(TimelineControlsComponent)
