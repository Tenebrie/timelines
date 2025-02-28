import Delete from '@mui/icons-material/Delete'
import LoadingButton from '@mui/lab/LoadingButton'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

import { useDeleteWorldEventMutation } from '@/api/worldEventApi'
import { useModal } from '@/app/features/modals/ModalsSlice'
import { Shortcut, useShortcut } from '@/app/hooks/useShortcut/useShortcut'
import { parseApiResponse } from '@/app/utils/parseApiResponse'
import { useStrictParams } from '@/router-utils/hooks/useStrictParams'
import Modal, { ModalFooter, ModalHeader, useModalCleanup } from '@/ui-lib/components/Modal'

export const DeleteEventModal = () => {
	const [deleteWorldEvent, { isLoading }] = useDeleteWorldEventMutation()
	const [deletionError, setDeletionError] = useState<string | null>(null)

	const navigate = useNavigate({ from: '/world/$worldId' })
	const { worldId } = useStrictParams({
		from: '/world/$worldId',
	})

	const { isOpen, target: targetEvent, close } = useModal('deleteEventModal')

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
			}),
		)
		if (error) {
			setDeletionError(error.message)
			return
		}

		close()
		navigate({ to: '/world/$worldId/timeline', search: true })
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
			<ModalHeader>Delete Event</ModalHeader>
			<Stack spacing={2}>
				<div>
					Attempting to permanently delete world event '<b>{targetEvent?.name}</b>'. This will also delete all
					associated data points, if any are present.
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
