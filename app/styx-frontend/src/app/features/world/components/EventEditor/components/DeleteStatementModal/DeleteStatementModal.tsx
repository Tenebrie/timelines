import { Delete } from '@mui/icons-material'
import { LoadingButton } from '@mui/lab'
import { Button, Tooltip } from '@mui/material'
import { Stack } from '@mui/system'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { useDeleteWorldStatementMutation } from '../../../../../../../api/rheaApi'
import { Shortcut, useShortcut } from '../../../../../../../hooks/useShortcut'
import Modal, {
	ModalFooter,
	ModalHeader,
	useModalCleanup,
} from '../../../../../../../ui-lib/components/Modal'
import { parseApiResponse } from '../../../../../../utils/parseApiResponse'
import { worldSlice } from '../../../../reducer'
import { useWorldRouter } from '../../../../router'
import { getDeleteStatementModalState } from '../../../../selectors'

export const DeleteStatementModal = () => {
	const [deleteWorldStatement, { isLoading }] = useDeleteWorldStatementMutation()
	const [deletionError, setDeletionError] = useState<string | null>(null)

	const { worldParams } = useWorldRouter()

	const dispatch = useDispatch()
	const { closeDeleteStatementModal } = worldSlice.actions

	const { isOpen, target: targetStatement } = useSelector(getDeleteStatementModalState)

	useModalCleanup({
		isOpen,
		onCleanup: () => {
			setDeletionError(null)
		},
	})

	const onConfirm = async () => {
		if (!isOpen || !targetStatement) {
			return
		}

		const { error } = parseApiResponse(
			await deleteWorldStatement({
				worldId: worldParams.worldId,
				statementId: targetStatement.id,
			})
		)
		if (error) {
			setDeletionError(error.message)
			return
		}

		dispatch(closeDeleteStatementModal())
	}

	const onCloseAttempt = () => {
		if (isLoading) {
			return
		}
		dispatch(closeDeleteStatementModal())
	}

	const { largeLabel: shortcutLabel } = useShortcut(Shortcut.CtrlEnter, () => {
		onConfirm()
	})

	return (
		<Modal visible={isOpen} onClose={onCloseAttempt}>
			<ModalHeader>Delete world</ModalHeader>
			<Stack spacing={2}>
				<div>
					Attempting to permanently delete world statement <b>{targetStatement?.title}</b>. It will unlink it
					from the issuer and revoker as well.
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
