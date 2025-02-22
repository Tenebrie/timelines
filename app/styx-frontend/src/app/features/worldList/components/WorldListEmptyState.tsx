import Button from '@mui/material/Button'
import ListItemButton from '@mui/material/ListItemButton'
import Stack from '@mui/material/Stack'
import { useDispatch } from 'react-redux'

import { OutlinedContainer } from '@/app/components/OutlinedContainer'

import { worldListSlice } from '../reducer'

type Props = {
	label: string
}

export const WorldListEmptyState = ({ label }: Props) => {
	const { openWorldWizardModal } = worldListSlice.actions
	const dispatch = useDispatch()

	const onCreate = async () => {
		dispatch(openWorldWizardModal())
	}

	return (
		<OutlinedContainer label={label}>
			<Stack direction="row" alignItems="center" gap={1} justifyContent={'center'}>
				<ListItemButton>Nothing has been created yet!</ListItemButton>
			</Stack>
			{<Button onClick={onCreate}>Create new world...</Button>}
		</OutlinedContainer>
	)
}
