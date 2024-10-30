import { Button, ListItemButton, Stack } from '@mui/material'

import { OutlinedContainer } from '../../../components/OutlinedContainer'

type Props = {
	label: string
	onCreate: () => void
}

export const WorldListEmptyState = ({ label, onCreate }: Props) => {
	return (
		<OutlinedContainer label={label}>
			<Stack direction="row" alignItems="center" gap={1} justifyContent={'center'}>
				<ListItemButton>Nothing has been created yet!</ListItemButton>
			</Stack>
			{<Button onClick={onCreate}>Create new world...</Button>}
		</OutlinedContainer>
	)
}
