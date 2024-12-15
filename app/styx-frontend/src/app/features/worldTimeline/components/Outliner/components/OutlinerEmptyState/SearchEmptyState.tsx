import { Stack, Typography } from '@mui/material'

export const SearchEmptyState = () => {
	return (
		<Stack direction="column" justifyContent="center" alignItems="center" margin={2} spacing={2}>
			<Typography variant="h6">No results found</Typography>
		</Stack>
	)
}
