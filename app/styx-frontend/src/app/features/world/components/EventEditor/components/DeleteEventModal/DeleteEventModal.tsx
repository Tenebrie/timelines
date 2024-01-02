import { Delete } from '@mui/icons-material'
import { LoadingButton } from '@mui/lab'
import { Button, Stack, Tooltip } from '@mui/material'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { useDeleteWorldEventMutation } from '../../../../../../../api/rheaApi'
import { Shortcut, useShortcut } from '../../../../../../../hooks/useShortcut'
import { useWorldRouter, worldRoutes } from '../../../../../../../router/routes/worldRoutes'
import Modal, {
	ModalFooter,
	ModalHeader,
	useModalCleanup,
} from '../../../../../../../ui-lib/components/Modal'
import { parseApiResponse } from '../../../../../../utils/parseApiResponse'
import { worldSlice } from '../../../../reducer'
import { getDeleteEventModalState } from '../../../../selectors'

export const DeleteEventModal = () => {
	const [deleteWorldEvent, { isLoading }] = useDeleteWorldEventMutation()
	const [deletionError, setDeletionError] = useState<string | null>(null)

	const { stateOf, navigateToCurrentWorldRoot } = useWorldRouter()
	const { worldId } = stateOf(worldRoutes.root)

	const dispatch = useDispatch()
	const { closeDeleteEventModal } = worldSlice.actions

	const { isOpen, target: targetEvent } = useSelector(getDeleteEventModalState)

	useModalCleanup({
		isOpen,
		onCleanup: () => {
			setDeletionError(null)
		},
	})

	const onConfirm = async () => {
		if (!isOpen || !targetEvent) {
			return
		}

		const { error } = parseApiResponse(
			await deleteWorldEvent({
				worldId,
				eventId: targetEvent.id,
			})
		)
		if (error) {
			setDeletionError(error.message)
			return
		}

		dispatch(closeDeleteEventModal())
		navigateToCurrentWorldRoot()
	}

	const onCloseAttempt = () => {
		if (isLoading) {
			return
		}
		dispatch(closeDeleteEventModal())
	}

	const { largeLabel: shortcutLabel } = useShortcut(Shortcut.CtrlEnter, () => {
		onConfirm()
	})

	return (
		<Modal visible={isOpen} onClose={onCloseAttempt}>
			<ModalHeader>Delete Event</ModalHeader>
			<Stack spacing={2}>
				<div>
					Attempting to permanently delete world event '<b>{targetEvent?.name}</b>'. This will also delete all
					associated delta states, if any are present.
				</div>
				<div>This action can't be reverted!</div>
				{deletionError && (
					<div style={{ color: 'red' }}>
						Unable to delete: <b>{deletionError}</b>
					</div>
				)}
			</Stack>
			<ModalFooter>
				<Tooltip title={shortcutLabel} arrow placement="top">
					<span>
						<LoadingButton
							loading={isLoading}
							variant="contained"
							color="error"
							onClick={onConfirm}
							loadingPosition="start"
							startIcon={<Delete />}
						>
							<span>Confirm</span>
						</LoadingButton>
					</span>
				</Tooltip>
				<Button variant="outlined" onClick={onCloseAttempt}>
					Cancel
				</Button>
			</ModalFooter>
		</Modal>
	)
}
