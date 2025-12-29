import { useGetMindmapQuery } from '@api/otherApi'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { useNavigate } from '@tanstack/react-router'
import { useSelector } from 'react-redux'

import { ActorDetails } from '@/app/components/Outliner/editors/actor/details/ActorDetails'
import { EventDetails } from '@/app/components/Outliner/editors/event/details/EventDetails'
import { useModal } from '@/app/features/modals/ModalsSlice'
import Modal, { ModalFooter } from '@/ui-lib/components/Modal'

import { getTimelineState, getWorldState } from '../WorldSliceSelectors'

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
			}),
		})
		// if (entityStack.length <= 1) {
		// 	closeAndUpdate({
		// 		entityStack: [],
		// 	})
		// 	return
		// }
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

function useCurrentEntity() {
	const { entityStack } = useModal('editEventModal')

	const {
		id: worldId,
		events,
		actors,
	} = useSelector(getWorldState, (a, b) => a.id === b.id && a.events === b.events && a.actors === b.actors)
	const { data: mindmapData } = useGetMindmapQuery({ worldId }, { skip: !worldId })
	const { markers } = useSelector(getTimelineState, (a, b) => a.markers === b.markers)

	if (entityStack.length === 0) {
		return null
	}

	const latestEntityId = entityStack[entityStack.length - 1]

	const event = events.find((e) => e.id === latestEntityId)
	if (event) {
		return { type: 'event', entity: event } as const
	}

	const marker = markers.find((m) => m.key === latestEntityId)
	if (marker) {
		const event = events.find((e) => e.id === marker.eventId)
		if (event) {
			return { type: 'event', entity: event } as const
		}
	}

	const node = mindmapData?.nodes.find((n) => n.id === latestEntityId)
	if (node) {
		const actor = actors.find((e) => e.id === node.parentActorId)
		if (actor) {
			return { type: 'actor', entity: actor } as const
		}
	}

	const actor = actors.find((a) => a.id === latestEntityId)
	if (actor) {
		return { type: 'actor', entity: actor } as const
	}
	return null
}
