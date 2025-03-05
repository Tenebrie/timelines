import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

export const OutlinerEmptySearch = () => {
	return (
		<Stack direction="column" justifyContent="center" alignItems="center" margin={2} spacing={2}>
			<Typography variant="h6">No results found</Typography>
		</Stack>
	)
}
