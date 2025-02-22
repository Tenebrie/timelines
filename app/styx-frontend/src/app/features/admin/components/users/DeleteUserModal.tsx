import Delete from '@mui/icons-material/Delete'
import LoadingButton from '@mui/lab/LoadingButton'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { useAdminDeleteUserMutation } from '@/api/adminUsersApi'
import { Shortcut, useShortcut } from '@/app/hooks/useShortcut'
import { parseApiResponse } from '@/app/utils/parseApiResponse'
import Modal, { ModalFooter, ModalHeader, useModalCleanup } from '@/ui-lib/components/Modal'

import { adminSlice } from '../../reducer'
import { getDeleteUserModalState } from '../../selectors'

export const DeleteUserModal = () => {
	const [deleteUser, { isLoading }] = useAdminDeleteUserMutation()
	const [deletionError, setDeletionError] = useState<string | null>(null)

	const dispatch = useDispatch()
	const { closeDeleteUserModal } = adminSlice.actions

	const { isOpen, targetUser } = useSelector(getDeleteUserModalState)

	useModalCleanup({
		isOpen,
		onCleanup: () => {
			setDeletionError(null)
		},
	})

	const onConfirm = async () => {
		if (!isOpen || !targetUser) {
			return
		}

		const { error } = parseApiResponse(
			await deleteUser({
				userId: targetUser.id,
			}),
		)
		if (error) {
			setDeletionError(error.message)
			return
		}

		dispatch(closeDeleteUserModal())
	}

	const onCloseAttempt = () => {
		if (isLoading) {
			return
		}
		dispatch(closeDeleteUserModal())
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
			<ModalHeader>Delete User</ModalHeader>
			<Stack spacing={2}>
				<div>
					Attempting to permanently delete user '<b>{targetUser?.username}</b>'. This will also delete all
					their data.
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
