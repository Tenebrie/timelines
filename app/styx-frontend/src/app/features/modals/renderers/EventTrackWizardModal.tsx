import { Add } from '@mui/icons-material'
import { LoadingButton } from '@mui/lab'
import { Button, TextField, Tooltip } from '@mui/material'
import { useEffect, useState } from 'react'

import { useCreateWorldEventTrackMutation } from '../../../../api/rheaApi'
import { Shortcut, useShortcut } from '../../../../hooks/useShortcut'
import { useWorldRouter, worldRoutes } from '../../../../router/routes/worldRoutes'
import Modal, { ModalFooter, ModalHeader, useModalCleanup } from '../../../../ui-lib/components/Modal'
import { parseApiResponse } from '../../../utils/parseApiResponse'
import { useModal } from '../reducer'

export const EventTrackWizardModal = () => {
	const { isOpen, close } = useModal('eventTrackWizard')

	const [name, setName] = useState('')
	const [position, setPosition] = useState(0)
	const [nameValidationError, setNameValidationError] = useState<string | null>(null)

	const [createWorldEventTrack, { isLoading }] = useCreateWorldEventTrackMutation()

	const { stateOf } = useWorldRouter()
	const { worldId } = stateOf(worldRoutes.eventEditor)

	useEffect(() => {
		setNameValidationError(null)
	}, [name])

	useModalCleanup({
		isOpen,
		onCleanup: () => {
			setName('')
			setPosition(0)
			setNameValidationError(null)
		},
	})

	const onConfirm = async () => {
		if (!isOpen) {
			return
		}

		if (!name.trim()) {
			setNameValidationError("Field can't be empty")
			return
		}

		const { error } = parseApiResponse(
			await createWorldEventTrack({
				worldId,
				body: {
					name: name.trim(),
					position,
					assignOrphans: true,
				},
			}),
		)
		if (error) {
			setNameValidationError(error.message)
			return
		}

		close()
	}

	const { largeLabel: shortcutLabel } = useShortcut(Shortcut.CtrlEnter, () => {
		onConfirm()
	})

	return (
		<Modal visible={isOpen} onClose={close}>
			<ModalHeader>Create new event track</ModalHeader>
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
			<ModalFooter>
				<Tooltip title={shortcutLabel} arrow placement="top">
					<span>
						<LoadingButton
							loading={isLoading}
							variant="contained"
							onClick={onConfirm}
							loadingPosition="start"
							startIcon={<Add />}
						>
							<span>Create</span>
						</LoadingButton>
					</span>
				</Tooltip>
				<Button variant="outlined" onClick={close}>
					Cancel
				</Button>
			</ModalFooter>
		</Modal>
	)
}