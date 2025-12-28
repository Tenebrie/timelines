import Button from '@mui/material/Button'
import ListItemButton from '@mui/material/ListItemButton'
import Stack from '@mui/material/Stack'

import { OutlinedContainer } from '@/app/components/OutlinedContainer'
import { useModal } from '@/app/features/modals/ModalsSlice'

type Props = {
	label: string
}

export const WorldListEmptyState = ({ label }: Props) => {
	const { open } = useModal('worldWizardModal')

	return (
		<OutlinedContainer label={label}>
			<Stack direction="row" alignItems="center" gap={1} justifyContent={'center'}>
				<ListItemButton>Nothing has been created yet!</ListItemButton>
			</Stack>
			{<Button onClick={open}>Create new world...</Button>}
		</OutlinedContainer>
	)
}
