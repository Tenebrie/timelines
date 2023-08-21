import { Button, Stack } from '@mui/material'

export const OutlinerTabs = () => {
	return (
		<Stack direction="row" sx={{ width: '100%' }}>
			<Button fullWidth variant="contained" color="secondary">
				Actors
			</Button>
			<Button fullWidth>Events</Button>
		</Stack>
	)
}
