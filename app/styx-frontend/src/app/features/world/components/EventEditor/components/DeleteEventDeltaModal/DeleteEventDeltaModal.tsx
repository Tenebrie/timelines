import { Delete } from '@mui/icons-material'
import { LoadingButton } from '@mui/lab'
import { Button, Stack, Tooltip } from '@mui/material'
import { useState } from 'react'

import { useDeleteWorldEventDeltaMutation } from '../../../../../../../api/rheaApi'
import { Shortcut, useShortcut } from '../../../../../../../hooks/useShortcut'
import { useWorldRouter, worldRoutes } from '../../../../../../../router/routes/worldRoutes'
import Modal, {
	ModalFooter,
	ModalHeader,
	useModalCleanup,
} from '../../../../../../../ui-lib/components/Modal'
import { parseApiResponse } from '../../../../../../utils/parseApiResponse'
import { useModal } from '../../../../../modals/reducer'

export const DeleteEventDeltaModal = () => {
	const [deleteWorldEvent, { isLoading }] = useDeleteWorldEventDeltaMutation()
	const [deletionError, setDeletionError] = useState<string | null>(null)

	const { stateOf, navigateToCurrentWorldRoot } = useWorldRouter()
	const { worldId } = stateOf(worldRoutes.root)

	const { isOpen, target: targetDelta, close } = useModal('deleteEventDeltaModal')

	useModalCleanup({
		isOpen,
		onCleanup: () => {
			setDeletionError(null)
		},
	})

	const onConfirm = async () => {
		if (!isOpen || !targetDelta) {
			return
		}

		const { error } = parseApiResponse(
			await deleteWorldEvent({
				worldId,
				eventId: targetDelta.worldEventId,
				deltaId: targetDelta.id,
			}),
		)
		if (error) {
			setDeletionError(error.message)
			return
		}

		close()
		navigateToCurrentWorldRoot()
	}

	const onCloseAttempt = () => {
		if (isLoading) {
			return
		}
		close()
	}

	const { largeLabel: shortcutLabel } = useShortcut(Shortcut.CtrlEnter, () => {
		onConfirm()
	})

	return (
		<Modal visible={isOpen} onClose={onCloseAttempt}>
			<ModalHeader>Delete Data Point</ModalHeader>
			<Stack spacing={2}>
				<div>
					Attempting to permanently delete data point '<b>{targetDelta?.name}</b>'.
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
