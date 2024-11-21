import { Delete } from '@mui/icons-material'
import { LoadingButton } from '@mui/lab'
import { Alert, Button, Collapse, Stack, Tooltip } from '@mui/material'
import { TransitionGroup } from 'react-transition-group'

import { useDeleteActorMutation } from '@/api/actorListApi'
import { useModal } from '@/app/features/modals/reducer'
import { parseApiResponse } from '@/app/utils/parseApiResponse'
import { useErrorState } from '@/app/utils/useErrorState'
import { Shortcut, useShortcut } from '@/hooks/useShortcut'
import { useWorldRouter, worldRoutes } from '@/router/routes/worldRoutes'
import Modal, { ModalFooter, ModalHeader, useModalCleanup } from '@/ui-lib/components/Modal'

export const DeleteActorModal = () => {
	const [deleteActor, { isLoading }] = useDeleteActorMutation()

	const { error, raiseError, clearError } = useErrorState<{
		SERVER_SIDE_ERROR: string
	}>()

	const { stateOf, navigateToCurrentWorldRoot } = useWorldRouter()
	const { worldId } = stateOf(worldRoutes.root)

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
