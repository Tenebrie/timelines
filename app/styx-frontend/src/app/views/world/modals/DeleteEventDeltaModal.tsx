import Delete from '@mui/icons-material/Delete'
import LoadingButton from '@mui/lab/LoadingButton'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useSelector } from 'react-redux'

import { useDeleteWorldEventDeltaMutation } from '@/api/worldEventDeltaApi'
import { useModal } from '@/app/features/modals/ModalsSlice'
import { Shortcut, useShortcut } from '@/app/hooks/useShortcut/useShortcut'
import { parseApiResponse } from '@/app/utils/parseApiResponse'
import Modal, { ModalFooter, ModalHeader, useModalCleanup } from '@/ui-lib/components/Modal'

import { getWorldIdState } from '../WorldSliceSelectors'

export const DeleteEventDeltaModal = () => {
	const [deleteWorldEvent, { isLoading }] = useDeleteWorldEventDeltaMutation()
	const [deletionError, setDeletionError] = useState<string | null>(null)

	const navigate = useNavigate({ from: '/world/$worldId' })
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
		navigate({ to: '/world/$worldId', search: true })
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
