import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'

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
