import { Stack, Typography } from '@mui/material'

export const OutlinerEmptyState = () => {
	return (
		<Stack direction="column" justifyContent="center" alignItems="center" margin={8} spacing={2}>
			<Typography variant="h6">It seems that nothing has happened yet!</Typography>
			<Typography variant="body1">
				Create a new event and make some statements about the state of your world after the event happens.
			</Typography>
		</Stack>
	)
}
