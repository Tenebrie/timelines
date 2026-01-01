import Delete from '@mui/icons-material/Delete'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { useState } from 'react'

import { useDeleteAsset } from '@/api/hooks/useDeleteAsset'
import { useModal } from '@/app/features/modals/ModalsSlice'
import { Shortcut, useShortcut } from '@/app/hooks/useShortcut/useShortcut'
import Modal, { ModalFooter, ModalHeader, useModalCleanup } from '@/ui-lib/components/Modal'

export const DeleteAssetModal = () => {
	const [deleteAsset, { isLoading }] = useDeleteAsset()
	const [deletionError, setDeletionError] = useState<string | null>(null)

	const { isOpen, assetId, assetName, close } = useModal('deleteAssetModal')

	useModalCleanup({
		isOpen,
		onCleanup: () => {
			setDeletionError(null)
		},
	})

	const onConfirm = async () => {
		if (!isOpen || !assetId) {
			return
		}

		const { error } = await deleteAsset(assetId)
		if (error) {
			setDeletionError(error.message)
			return
		}

		close()
	}

	const onCloseAttempt = () => {
		if (!isLoading) {
			close()
		}
	}

	const { largeLabel: shortcutLabel } = useShortcut(
		[Shortcut.Enter, Shortcut.CtrlEnter],
		() => {
			onConfirm()
		},
		isOpen,
	)

	return (
		<Modal visible={isOpen} onClose={onCloseAttempt}>
			<ModalHeader>Delete asset?</ModalHeader>
			<Stack spacing={2}>
				<Typography>
					Are you sure you want to delete <strong>{assetName}</strong>?
				</Typography>
				<Typography color="text.secondary">
					This action cannot be undone. The asset will be permanently removed from storage.
				</Typography>
				{deletionError && (
					<Typography color="error" variant="body2">
						{deletionError}
					</Typography>
				)}
			</Stack>
			<ModalFooter>
				<Tooltip title={shortcutLabel} arrow placement="top">
					<span>
						<Button
							loading={isLoading}
							variant="contained"
							color="error"
							onClick={onConfirm}
							loadingPosition="start"
							startIcon={<Delete />}
						>
							Delete
						</Button>
					</span>
				</Tooltip>
				<Button variant="outlined" onClick={onCloseAttempt} disabled={isLoading}>
					Cancel
				</Button>
			</ModalFooter>
		</Modal>
	)
}
