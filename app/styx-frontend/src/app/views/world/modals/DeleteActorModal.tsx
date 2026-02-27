import { useDeleteActorMutation } from '@api/actorListApi'
import Delete from '@mui/icons-material/Delete'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import { useState } from 'react'

import { useModal } from '@/app/features/modals/ModalsSlice'
import { Shortcut, useShortcut } from '@/app/hooks/useShortcut/useShortcut'
import { parseApiResponse } from '@/app/utils/parseApiResponse'
import { useStrictParams } from '@/router-utils/hooks/useStrictParams'
import Modal, { ModalFooter, ModalHeader, useModalCleanup } from '@/ui-lib/components/Modal'

export const DeleteActorModal = () => {
	const [deleteActor, { isLoading }] = useDeleteActorMutation()
	const [deletionError, setDeletionError] = useState<string | null>(null)

	const { worldId } = useStrictParams({
		from: '/world/$worldId/_world',
	})

	const { isOpen, target: targetActor, close } = useModal('deleteActorModal')

	useModalCleanup({
		isOpen,
		onCleanup: () => {
			setDeletionError(null)
		},
	})

	const onConfirm = async () => {
		if (!isOpen || !targetActor) {
			return
		}

		const { error } = parseApiResponse(
			await deleteActor({
				worldId,
				actorId: targetActor.id,
			}),
		)
		if (error) {
			setDeletionError(error.message)
			return
		}

		close()
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
			<ModalHeader>Delete Actor</ModalHeader>
			<Stack spacing={2}>
				<div>
					Attempting to permanently delete actor &apos;<b>{targetActor?.name}</b>&apos;.
				</div>
				<div>This action can&apos;t be reverted!</div>
				{deletionError && (
					<div style={{ color: 'red' }}>
						Unable to delete: <b>{deletionError}</b>
					</div>
				)}
			</Stack>
			<ModalFooter>
				<Tooltip title={shortcutLabel} arrow placement="top">
					<Button
						loading={isLoading}
						variant="contained"
						color="error"
						onClick={onConfirm}
						loadingPosition="start"
						startIcon={<Delete />}
					>
						<span>Confirm</span>
					</Button>
				</Tooltip>
				<Button variant="outlined" onClick={onCloseAttempt}>
					Cancel
				</Button>
			</ModalFooter>
		</Modal>
	)
}
