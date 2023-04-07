import { Link, Stack, Typography } from '@mui/material'
import { NavLink } from 'react-router-dom'

export const OutlinerEmptyState = () => {
	return (
		<Stack direction="column" justifyContent="center" alignItems="center">
			<Typography variant="h6">It seems that nothing has happened yet!</Typography>
			<Typography variant="body1">
				Create a new event and make some statements about the state of your world after the event happens.
			</Typography>
			<Link component={NavLink} to="/spinny">
				Learn more about events and statements.
			</Link>
		</Stack>
	)
}
