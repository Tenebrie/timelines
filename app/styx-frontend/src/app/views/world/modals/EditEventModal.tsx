import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'

import { EventDetails } from '@/app/components/Outliner/editors/event/details/EventDetails'
import { useModal } from '@/app/features/modals/ModalsSlice'
import Modal, { ModalFooter } from '@/ui-lib/components/Modal'

export const EditEventModal = () => {
	const { isOpen, close } = useModal('editEventModal')

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
				<EventDetails autoFocus={isOpen} />
				<ModalFooter>
					<Button variant="contained" onClick={handleClose}>
						Done
					</Button>
				</ModalFooter>
			</Stack>
		</Modal>
	)
}
