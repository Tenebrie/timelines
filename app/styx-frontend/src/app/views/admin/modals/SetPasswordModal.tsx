import Key from '@mui/icons-material/Key'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import { useState } from 'react'

import { useAdminSetUserPasswordMutation } from '@/api/adminUsersApi'
import { useModal } from '@/app/features/modals/ModalsSlice'
import { Shortcut, useShortcut } from '@/app/hooks/useShortcut/useShortcut'
import { parseApiResponse } from '@/app/utils/parseApiResponse'
import Modal, { ModalFooter, ModalHeader, useModalCleanup } from '@/ui-lib/components/Modal'

export const SetPasswordModal = () => {
	const [setUserPassword, { isLoading }] = useAdminSetUserPasswordMutation()
	const [password, setPassword] = useState('')
	const [error, setError] = useState<string | null>(null)

	const { isOpen, targetUser, close } = useModal('setPasswordModal')

	useModalCleanup({
		isOpen,
		onCleanup: () => {
			setPassword('')
			setError(null)
		},
	})

	const onConfirm = async () => {
		if (!isOpen || !targetUser) {
			return
		}

		if (!password || password.trim().length === 0) {
			setError('Password cannot be empty')
			return
		}

		const { error: apiError } = parseApiResponse(
			await setUserPassword({
				userId: targetUser.id,
				body: {
					password,
				},
			}),
		)
		if (apiError) {
			setError(apiError.message)
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
			<ModalHeader>Set Password</ModalHeader>
			<Stack spacing={2}>
				<div>
					Setting password for user &apos;<b>{targetUser?.username}</b>&apos;.
				</div>
				<TextField
					label="New Password"
					type="password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					fullWidth
					autoFocus
					error={!!error}
					helperText={error}
				/>
			</Stack>
			<ModalFooter>
				<Tooltip title={shortcutLabel} arrow placement="top">
					<Button
						loading={isLoading}
						variant="contained"
						color="primary"
						onClick={onConfirm}
						loadingPosition="start"
						startIcon={<Key />}
					>
						<span>Set Password</span>
					</Button>
				</Tooltip>
				<Button variant="outlined" onClick={onCloseAttempt}>
					Cancel
				</Button>
			</ModalFooter>
		</Modal>
	)
}
