import { Delete, Save } from '@mui/icons-material'
import { LoadingButton } from '@mui/lab'
import { Button, Stack, TextField, Tooltip } from '@mui/material'
import { useState } from 'react'

import { useDeleteWorldEventTrackMutation, useUpdateWorldEventTrackMutation } from '../../../../api/rheaApi'
import { Shortcut, useShortcut } from '../../../../hooks/useShortcut'
import { useWorldRouter, worldRoutes } from '../../../../router/routes/worldRoutes'
import Modal, { ModalFooter, ModalHeader, useModalCleanup } from '../../../../ui-lib/components/Modal'
import { parseApiResponse } from '../../../utils/parseApiResponse'
import { useModal } from '../reducer'

export const EventTrackEditModal = () => {
	const [updateWorldEvent, { isLoading: isUpdating }] = useUpdateWorldEventTrackMutation()
	const [deleteWorldEvent, { isLoading: isDeleting }] = useDeleteWorldEventTrackMutation()
	const [deletionError, setDeletionError] = useState<string | null>(null)

	const { isOpen, target: targetTrack, close } = useModal('eventTrackEdit')

	const [name, setName] = useState('')
	const [position, setPosition] = useState(0)
	const [nameValidationError, setNameValidationError] = useState<string | null>(null)

	const { stateOf, navigateToCurrentWorldRoot } = useWorldRouter()
	const { worldId } = stateOf(worldRoutes.root)

	useModalCleanup({
		isOpen,
		onCleanup: () => {
			if (targetTrack) {
				setName(targetTrack.name)
				setPosition(targetTrack.position)
			}
			setNameValidationError(null)
			setDeletionError(null)
		},
	})

	const onConfirmUpdate = async () => {
		if (!isOpen || !targetTrack) {
			return
		}

		const { error } = parseApiResponse(
			await updateWorldEvent({
				worldId,
				trackId: targetTrack.id,
				body: {
					name,
					position,
				},
			}),
		)
		if (error) {
			setNameValidationError(error.message)
			return
		}

		close()
		navigateToCurrentWorldRoot()
	}

	const onConfirmDelete = async () => {
		if (!isOpen || !targetTrack) {
			return
		}

		const { error } = parseApiResponse(
			await deleteWorldEvent({
				worldId,
				trackId: targetTrack.id,
			}),
		)
		if (error) {
			setNameValidationError(error.message)
			return
		}

		close()
		navigateToCurrentWorldRoot()
	}

	const onCloseAttempt = () => {
		if (isUpdating || isDeleting) {
			return
		}
		close()
	}

	const { largeLabel: shortcutLabel } = useShortcut(Shortcut.CtrlEnter, () => {
		onConfirmUpdate()
	})

	return (
		<Modal visible={isOpen} onClose={onCloseAttempt}>
			<ModalHeader>Edit Event Track</ModalHeader>
			<TextField
				label="Name"
				type="text"
				value={name}
				onChange={(event) => setName(event.target.value)}
				error={!!nameValidationError}
				helperText={nameValidationError}
				autoFocus
			/>
			<TextField
				type="number"
				label="Position"
				value={position}
				onChange={(e) => setPosition(parseInt(e.target.value))}
			/>
			{/* <Stack spacing={2}>
				<div>
					Attempting to permanently delete world event '<b>{targetEvent?.name}</b>'. This will also delete all
					associated data points, if any are present.
				</div>
				<div>This action can't be reverted!</div>
				{deletionError && (
					<div style={{ color: 'red' }}>
						Unable to delete: <b>{deletionError}</b>
					</div>
				)}
			</Stack> */}
			<ModalFooter>
				<Stack direction="row-reverse" justifyContent="space-between" width="100%">
					<Stack direction="row-reverse" spacing={2}>
						<Tooltip title={shortcutLabel} arrow placement="top">
							<span>
								<LoadingButton
									loading={isUpdating}
									variant="contained"
									color="primary"
									onClick={onConfirmUpdate}
									loadingPosition="start"
									startIcon={<Save />}
								>
									<span>Save</span>
								</LoadingButton>
							</span>
						</Tooltip>
						<Button variant="outlined" onClick={onCloseAttempt}>
							Cancel
						</Button>
					</Stack>
					<LoadingButton
						loading={isDeleting}
						variant="contained"
						color="error"
						onClick={onConfirmDelete}
						loadingPosition="start"
						startIcon={<Delete />}
					>
						<span>Delete</span>
					</LoadingButton>
				</Stack>
			</ModalFooter>
		</Modal>
	)
}
