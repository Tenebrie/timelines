import { Delete, Save } from '@mui/icons-material'
import { LoadingButton } from '@mui/lab'
import { Button, Stack, TextField, Tooltip, Typography } from '@mui/material'
import { useState } from 'react'
import { useSelector } from 'react-redux'

import { useDeleteWorldEventTrackMutation, useUpdateWorldEventTrackMutation } from '@/api/worldEventTracksApi'
import { parseApiResponse } from '@/app/utils/parseApiResponse'
import { Shortcut, useShortcut } from '@/hooks/useShortcut'
import { useWorldTimelineRouter } from '@/router/routes/worldTimelineRoutes'
import Modal, { ModalFooter, ModalHeader, useModalCleanup } from '@/ui-lib/components/Modal'

import { getWorldIdState } from '../../worldTimeline/selectors'
import { useModal } from '../reducer'

export const EventTrackEditModal = () => {
	const [updateWorldEvent, { isLoading: isUpdating }] = useUpdateWorldEventTrackMutation()
	const [deleteWorldEvent, { isLoading: isDeleting }] = useDeleteWorldEventTrackMutation()
	const [deletionError, setDeletionError] = useState<string | null>(null)

	const { isOpen, target: targetTrack, close } = useModal('eventTrackEdit')

	const [name, setName] = useState('')
	const [nameValidationError, setNameValidationError] = useState<string | null>(null)

	const { navigateToCurrentWorldRoot } = useWorldTimelineRouter()
	const worldId = useSelector(getWorldIdState)

	useModalCleanup({
		isOpen,
		onCleanup: () => {
			if (targetTrack) {
				setName(targetTrack.name)
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
					position: targetTrack.position,
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

	const { largeLabel: shortcutLabel } = useShortcut(
		Shortcut.CtrlEnter,
		() => {
			onConfirmUpdate()
		},
		isOpen ? 1 : -1,
	)

	return (
		<Modal visible={isOpen} onClose={onCloseAttempt}>
			<ModalHeader>Edit Event Track</ModalHeader>
			<TextField
				label="Name"
				type="text"
				value={name}
				onChange={(event) => setName(event.target.value)}
				error={!!nameValidationError || !!deletionError}
				helperText={nameValidationError || deletionError}
				autoFocus
			/>
			<Stack spacing={2}>
				<Typography>Deleting a track will safely unassign all events from it.</Typography>
			</Stack>
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
