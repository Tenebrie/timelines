import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'

import { ActorDetails } from '@/app/components/Outliner/editors/actor/details/ActorDetails'
import { useModal } from '@/app/features/modals/ModalsSlice'
import Modal, { ModalFooter } from '@/ui-lib/components/Modal'

export const EditActorModal = () => {
	const { isOpen, close } = useModal('editActorModal')

	const handleClose = () => {
		close()
	}

	return (
		<Modal visible={isOpen} onClose={handleClose}>
			<Stack
				direction={'column'}
				gap={2}
				sx={{
					height: '80vh',
					display: 'flex',
					flexDirection: 'column',
				}}
			>
				<ActorDetails />
				<ModalFooter>
					<Button variant="contained" onClick={handleClose}>
						Done
					</Button>
				</ModalFooter>
			</Stack>
		</Modal>
	)
}
