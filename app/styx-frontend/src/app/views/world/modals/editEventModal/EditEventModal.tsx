import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { useNavigate } from '@tanstack/react-router'

import { ActorDetails } from '@/app/components/Outliner/editors/actor/details/ActorDetails'
import { EventDetails } from '@/app/components/Outliner/editors/event/details/EventDetails'
import { useModal } from '@/app/features/modals/ModalsSlice'
import Modal, { ModalFooter } from '@/ui-lib/components/Modal'

import { EntityBreadcrumbs } from './EntityBreadcrumbs'
import { useCurrentEntity } from './hooks/useCurrentEntity'

export const EditEventModal = () => {
	const { isOpen, entityStack } = useModal('editEventModal')
	const navigate = useNavigate({ from: '/world/$worldId' })

	const handleClose = () => {
		const newStack = [...entityStack]
		if (entityStack.length > 0) {
			newStack.pop()
		}
		navigate({
			search: (prev) => ({
				...prev,
				selection: newStack,
				new: undefined,
			}),
		})
	}

	const handleBreadcrumbClick = (targetIndex: number) => {
		const newStack = entityStack.slice(0, targetIndex + 1)
		navigate({
			search: (prev) => ({
				...prev,
				selection: newStack,
			}),
		})
	}

	const currentEntity = useCurrentEntity()

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
				<EntityBreadcrumbs entityStack={entityStack} onBreadcrumbClick={handleBreadcrumbClick} />

				{currentEntity?.type === 'event' && (
					<EventDetails editedEvent={currentEntity.entity} autoFocus={isOpen} />
				)}
				{currentEntity?.type === 'actor' && <ActorDetails editedActor={currentEntity.entity} />}

				<ModalFooter>
					<Button variant="contained" onClick={handleClose}>
						Done
					</Button>
				</ModalFooter>
			</Stack>
		</Modal>
	)
}
