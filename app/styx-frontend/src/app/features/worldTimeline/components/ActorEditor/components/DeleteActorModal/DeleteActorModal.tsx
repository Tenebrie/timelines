import Delete from '@mui/icons-material/Delete'
import LoadingButton from '@mui/lab/LoadingButton'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Collapse from '@mui/material/Collapse'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import { useNavigate } from '@tanstack/react-router'
import { useSelector } from 'react-redux'
import { TransitionGroup } from 'react-transition-group'

import { useDeleteActorMutation } from '@/api/actorListApi'
import { useModal } from '@/app/features/modals/reducer'
import { getWorldIdState } from '@/app/features/world/selectors'
import { Shortcut, useShortcut } from '@/app/hooks/useShortcut'
import { parseApiResponse } from '@/app/utils/parseApiResponse'
import { useErrorState } from '@/app/utils/useErrorState'
import Modal, { ModalFooter, ModalHeader, useModalCleanup } from '@/ui-lib/components/Modal'

export const DeleteActorModal = () => {
	const [deleteActor, { isLoading }] = useDeleteActorMutation()

	const { error, raiseError, clearError } = useErrorState<{
		SERVER_SIDE_ERROR: string
	}>()

	const navigate = useNavigate({ from: '/world/$worldId' })
	const worldId = useSelector(getWorldIdState)

	const { isOpen, target: targetActor, close } = useModal('deleteActorModal')

	useModalCleanup({
		isOpen,
		onCleanup: () => {
			clearError()
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
			raiseError('SERVER_SIDE_ERROR', error.message)
			return
		}

		close()
		navigate({ to: '/world/$worldId' })
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
					Attempting to permanently delete actor '
					<b>
						{targetActor?.name}, {targetActor?.title}
					</b>
					'. Any associated statements will be deleted as well.
				</div>
				<div>This action can't be reverted!</div>
				<TransitionGroup>
					{!!error && (
						<Collapse>
							<Alert severity="error">{error.data}</Alert>
						</Collapse>
					)}
				</TransitionGroup>
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
