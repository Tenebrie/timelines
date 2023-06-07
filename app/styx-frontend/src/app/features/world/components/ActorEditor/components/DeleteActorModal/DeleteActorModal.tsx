import { Delete } from '@mui/icons-material'
import { LoadingButton } from '@mui/lab'
import { Alert, Button, Collapse, Stack, Tooltip } from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'
import { TransitionGroup } from 'react-transition-group'

import { useDeleteActorMutation } from '../../../../../../../api/rheaApi'
import { Shortcut, useShortcut } from '../../../../../../../hooks/useShortcut'
import Modal, {
	ModalFooter,
	ModalHeader,
	useModalCleanup,
} from '../../../../../../../ui-lib/components/Modal'
import { parseApiResponse } from '../../../../../../utils/parseApiResponse'
import { useErrorState } from '../../../../../../utils/useErrorState'
import { worldSlice } from '../../../../reducer'
import { useWorldRouter } from '../../../../router'
import { getDeleteActorModalState } from '../../../../selectors'

export const DeleteActorModal = () => {
	const [deleteActor, { isLoading }] = useDeleteActorMutation()

	const { error, raiseError, clearError } = useErrorState<{
		SERVER_SIDE_ERROR: string
	}>()

	const { worldParams, navigateToCurrentWorld } = useWorldRouter()

	const dispatch = useDispatch()
	const { closeDeleteActorModal } = worldSlice.actions

	const { isOpen, target: targetActor } = useSelector(getDeleteActorModalState)

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
				worldId: worldParams.worldId,
				actorId: targetActor.id,
			})
		)
		if (error) {
			raiseError('SERVER_SIDE_ERROR', error.message)
			return
		}

		dispatch(closeDeleteActorModal())
		navigateToCurrentWorld()
	}

	const onCloseAttempt = () => {
		if (isLoading) {
			return
		}
		dispatch(closeDeleteActorModal())
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
