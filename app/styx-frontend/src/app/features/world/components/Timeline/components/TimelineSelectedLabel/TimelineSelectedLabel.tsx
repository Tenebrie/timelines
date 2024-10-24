import { ArrowForward, Close } from '@mui/icons-material'
import { Button, IconButton, Stack } from '@mui/material'

import { useWorldRouter } from '../../../../../../../router/routes/worldRoutes'
import { useWorldTime } from '../../../../../time/hooks/useWorldTime'

type Props = {
	onNavigateToTime: (timestamp: number) => void
}

export const TimelineSelectedLabel = ({ onNavigateToTime }: Props) => {
	const { selectedTimeOrNull, navigateToOutliner, navigateToCurrentWorldRoot } = useWorldRouter()
	const { timeToLabel } = useWorldTime()

	if (selectedTimeOrNull === null) {
		return <></>
	}

	return (
		<div style={{ position: 'absolute', top: 4, left: 0, marginLeft: 32 }}>
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
		</div>
	)
}
