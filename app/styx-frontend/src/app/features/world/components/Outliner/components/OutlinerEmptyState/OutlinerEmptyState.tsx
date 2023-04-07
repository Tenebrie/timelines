import { Button, Grid, Stack, Typography } from '@mui/material'
import { useDispatch } from 'react-redux'

import { worldSlice } from '../../../../reducer'

type Props = {
	selectedTime: number
}

export const OutlinerEmptyState = ({ selectedTime }: Props) => {
	const dispatch = useDispatch()
	const { openEventWizard, openEventTutorialModal } = worldSlice.actions

	const onCreateEvent = () => {
		dispatch(openEventWizard({ timestamp: selectedTime }))
	}

	const onShowTutorial = () => {
		dispatch(openEventTutorialModal())
	}

	return (
		<Stack direction="column" justifyContent="center" alignItems="center" margin={8} spacing={2}>
			<Typography variant="h6">It seems that nothing has happened yet!</Typography>
			<Typography variant="body1">
				Create a new event and make some statements about the state of your world after the event happens.
			</Typography>
			<Grid container direction="column" alignItems="center" justifyContent="center" spacing={2}>
				<Grid item>
					<Button onClick={onCreateEvent} variant="contained">
						Create a new event
					</Button>
				</Grid>
				<Grid item>
					<Button onClick={onShowTutorial} variant="outlined" color="secondary">
						Learn more about events and statements
					</Button>
				</Grid>
			</Grid>
		</Stack>
	)
}
