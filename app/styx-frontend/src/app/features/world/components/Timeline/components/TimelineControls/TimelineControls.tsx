import { ArrowForward, Close, ZoomIn, ZoomOut } from '@mui/icons-material'
import { Button, IconButton, Stack } from '@mui/material'
import { memo } from 'react'

import { useWorldRouter } from '../../../../../../../router/routes/worldRoutes'
import { useWorldTime } from '../../../../../time/hooks/useWorldTime'

type Props = {
	onNavigateToTime: (timestamp: number) => void
	onZoomIn: () => void
	onZoomOut: () => void
}

const TimelineControlsComponent = ({ onNavigateToTime, onZoomIn, onZoomOut }: Props) => {
	const { selectedTimeOrNull, navigateToOutliner, navigateToCurrentWorldRoot } = useWorldRouter()
	const { timeToLabel } = useWorldTime()

	if (selectedTimeOrNull === null) {
		return <></>
	}

	return (
		<div
			style={{
				position: 'absolute',
				top: 4,
				left: 0,
				marginLeft: 32,
				marginRight: 32,
				width: 'calc(100% - 64px)',
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
		</div>
	)
}

export const TimelineControls = memo(TimelineControlsComponent)
