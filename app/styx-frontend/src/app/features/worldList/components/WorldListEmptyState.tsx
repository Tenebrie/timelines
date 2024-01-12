import { Button, ListItemButton, Stack } from '@mui/material'

import { OverlayingLabel } from '../../../components/OverlayingLabel'
import { WorldsUnit } from '../styles'

type Props = {
	label: string
	onCreate: () => void
}

export const WorldListEmptyState = ({ label, onCreate }: Props) => {
	return (
		<WorldsUnit style={{ maxWidth: 600, minWidth: 400 }}>
			<OverlayingLabel>{label}</OverlayingLabel>
			<Stack direction="row" alignItems="center" gap={1} justifyContent={'center'}>
				<ListItemButton>Nothing has been created yet!</ListItemButton>
			</Stack>
			{<Button onClick={onCreate}>Create new world...</Button>}
		</WorldsUnit>
	)
}
