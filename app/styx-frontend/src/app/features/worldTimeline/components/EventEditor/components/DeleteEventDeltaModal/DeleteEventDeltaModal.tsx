import Delete from '@mui/icons-material/Delete'
import LoadingButton from '@mui/lab/LoadingButton'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import { useState } from 'react'
import { useSelector } from 'react-redux'

import { useDeleteWorldEventDeltaMutation } from '@/api/worldEventDeltaApi'
import { useModal } from '@/app/features/modals/reducer'
import { getWorldIdState } from '@/app/features/world/selectors'
import { parseApiResponse } from '@/app/utils/parseApiResponse'
import { Shortcut, useShortcut } from '@/hooks/useShortcut'
import { useWorldTimelineRouter } from '@/router/routes/featureRoutes/worldTimelineRoutes'
import Modal, { ModalFooter, ModalHeader, useModalCleanup } from '@/ui-lib/components/Modal'

export const DeleteEventDeltaModal = () => {
	const [deleteWorldEvent, { isLoading }] = useDeleteWorldEventDeltaMutation()
	const [deletionError, setDeletionError] = useState<string | null>(null)

	const { navigateToCurrentWorldRoot } = useWorldTimelineRouter()
	const worldId = useSelector(getWorldIdState)

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

	const { largeLabel: shortcutLabel } = useShortcut(
		Shortcut.CtrlEnter,
		() => {
			onConfirm()
		},
		isOpen ? 1 : -1,
	)

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
