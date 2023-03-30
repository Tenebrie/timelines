import { Delete } from '@mui/icons-material'
import { Button, Tooltip } from '@mui/material'
import { Stack } from '@mui/system'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { useDeleteWorldMutation, useGetWorldsQuery } from '../../../../api/rheaApi'
import { Shortcut, useShortcut } from '../../../../hooks/useShortcut'
import Modal, { ModalFooter, useModalCleanup } from '../../../../ui-lib/components/Modal'
import { ModalHeader } from '../../../../ui-lib/components/Modal/styles'
import { parseApiError } from '../../../utils/parseApiError'
import { worldListSlice } from '../reducer'
import { getDeleteWorldModalState } from '../selectors'

export const DeleteWorldModal = () => {
	const { isOpen, worldId, worldName } = useSelector(getDeleteWorldModalState)

	const [confirmDeleteWorld] = useDeleteWorldMutation()
	const { refetch: refetchWorlds } = useGetWorldsQuery()
	const [deletionError, setDeletionError] = useState<string | null>(null)

	const dispatch = useDispatch()
	const { closeDeleteWorldModal } = worldListSlice.actions

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

		const response = await confirmDeleteWorld({
			worldId,
		})
		const error = parseApiError(response)
		if (error) {
			setDeletionError(error.message)
			return
		}

		refetchWorlds()
		dispatch(closeDeleteWorldModal())
	}

	const { largeLabel: shortcutLabel } = useShortcut(Shortcut.CtrlEnter, () => {
		onConfirm()
	})

	return (
		<Modal visible={isOpen} onClose={() => dispatch(closeDeleteWorldModal())}>
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
					<Button variant="contained" color="error" onClick={onConfirm}>
						<Delete /> Confirm
					</Button>
				</Tooltip>
				<Button variant="outlined" onClick={() => dispatch(closeDeleteWorldModal())}>
					Cancel
				</Button>
			</ModalFooter>
		</Modal>
	)
}
