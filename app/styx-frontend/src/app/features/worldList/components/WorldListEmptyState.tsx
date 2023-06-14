import { ListItemButton, Stack } from '@mui/material'

export const WorldListEmptyState = () => {
	return (
		<Stack direction="row" alignItems="center" gap={1} justifyContent={'center'}>
			<ListItemButton>Nothing has been created yet!</ListItemButton>
		</Stack>
	)
}
