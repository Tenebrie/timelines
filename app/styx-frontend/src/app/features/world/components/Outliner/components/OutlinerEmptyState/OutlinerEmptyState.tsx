import { Button, Grid, Stack, Typography } from '@mui/material'

import { useWorldRouter } from '@/router/routes/worldRoutes'

export const OutlinerEmptyState = () => {
	// const dispatch = useDispatch()
	const { navigateToEventCreator } = useWorldRouter()
	// const { openEventTutorialModal } = worldSlice.actions

	const onCreateEvent = () => {
		navigateToEventCreator()
	}

	// const onShowTutorial = () => {
	// dispatch(openEventTutorialModal())
	// }

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
					{/* <Button onClick={onShowTutorial} variant="outlined" color="secondary">
						Learn more about events
					</Button> */}
				</Grid>
			</Grid>
		</Stack>
	)
}
