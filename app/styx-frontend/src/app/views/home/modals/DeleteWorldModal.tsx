import { useDeleteWorldMutation } from '@api/worldListApi'
import Delete from '@mui/icons-material/Delete'
import LoadingButton from '@mui/lab/LoadingButton'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import { useState } from 'react'

import { useModal } from '@/app/features/modals/ModalsSlice'
import { Shortcut, useShortcut } from '@/app/hooks/useShortcut/useShortcut'
import { parseApiResponse } from '@/app/utils/parseApiResponse'
import Modal, { ModalFooter, useModalCleanup } from '@/ui-lib/components/Modal'
import { ModalHeader } from '@/ui-lib/components/Modal/styles'

export const DeleteWorldModal = () => {
	const { isOpen, worldId, worldName, close } = useModal('deleteWorldModal')

	const [confirmDeleteWorld, { isLoading }] = useDeleteWorldMutation()
	const [deletionError, setDeletionError] = useState<string | null>(null)

	useModalCleanup({
		isOpen,
		onCleanup: () => {
			setDeletionError(null)
		},
	})

	const onConfirm = async () => {
		if (!isOpen) {
			return
		}

		const { error } = parseApiResponse(
			await confirmDeleteWorld({
				worldId,
			}),
		)
		if (error) {
			setDeletionError(error.message)
			return
		}

		close()
	}

	const onClose = () => {
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
		<Modal visible={isOpen} onClose={onClose}>
			<ModalHeader>Delete world</ModalHeader>
			<Stack spacing={2}>
				<div>
					Attempting to permanently delete world <b>{worldName}</b>.
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
				<Button variant="outlined" onClick={onClose}>
					Cancel
				</Button>
			</ModalFooter>
		</Modal>
	)
}
