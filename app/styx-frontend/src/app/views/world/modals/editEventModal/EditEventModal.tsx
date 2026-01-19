import Stack from '@mui/material/Stack'

import { ActorDetails } from '@/app/components/Outliner/editors/actor/details/ActorDetails'
import { EventDetails } from '@/app/components/Outliner/editors/event/details/EventDetails'
import { useModal } from '@/app/features/modals/ModalsSlice'
import { useStableNavigate } from '@/router-utils/hooks/useStableNavigate'
import Modal from '@/ui-lib/components/Modal'

import { EntityBreadcrumbs } from './EntityBreadcrumbs'
import { useCurrentEntity } from './hooks/useCurrentEntity'

export const EditEventModal = () => {
	const { isOpen, entityStack } = useModal('editEventModal')
	const navigate = useStableNavigate({ from: '/world/$worldId' })

	const handleClose = () => {
		const newStack = [...entityStack]
		if (entityStack.length > 0) {
			newStack.pop()
		}
		navigate({
			search: (prev) => ({
				...prev,
				navi: newStack,
				new: undefined,
				tab: undefined,
				iq: undefined,
			}),
		})
	}

	const handleBreadcrumbClick = (targetIndex: number) => {
		const newStack = entityStack.slice(0, targetIndex + 1)
		navigate({
			search: (prev) => ({
				...prev,
				navi: newStack,
			}),
		})
	}

	const handleWorldClick = () => {
		navigate({
			search: (prev) => ({
				...prev,
				navi: [],
				new: undefined,
			}),
		})
	}

	const currentEntity = useCurrentEntity()

	return (
		<Modal visible={isOpen} onClose={handleClose} closeOnBackdropClick>
			<Stack
				direction={'column'}
				gap={2}
				sx={{
					height: '95vh',
					display: 'flex',
					flexDirection: 'column',
				}}
			>
				<EntityBreadcrumbs
					entityStack={entityStack}
					onBreadcrumbClick={handleBreadcrumbClick}
					onWorldClick={handleWorldClick}
					onClose={handleClose}
				/>

				<Stack direction="row" width="100%" height="100%" flexDirection="column">
					{currentEntity?.type === 'event' && (
						<EventDetails editedEvent={currentEntity.entity} autoFocus={isOpen} />
					)}
					{currentEntity?.type === 'actor' && <ActorDetails editedActor={currentEntity.entity} />}
				</Stack>
			</Stack>
		</Modal>
	)
}
