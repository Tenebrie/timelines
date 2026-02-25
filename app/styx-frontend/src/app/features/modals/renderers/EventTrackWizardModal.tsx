import Add from '@mui/icons-material/Add'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormGroup from '@mui/material/FormGroup'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

import { useCreateWorldEventTrackMutation } from '@/api/worldEventTracksApi'
import { Shortcut, useShortcut } from '@/app/hooks/useShortcut/useShortcut'
import { isEntityNameValid } from '@/app/utils/isEntityNameValid'
import { parseApiResponse } from '@/app/utils/parseApiResponse'
import { getWorldIdState } from '@/app/views/world/WorldSliceSelectors'
import Modal, { ModalFooter, ModalHeader, useModalCleanup } from '@/ui-lib/components/Modal'

import { useModal } from '../ModalsSlice'

export const EventTrackWizardModal = () => {
	const { isOpen, close } = useModal('eventTrackWizard')

	const [name, setName] = useState('')
	const [assignOrphans, setAssignOrphans] = useState(false)
	const [nameValidationError, setNameValidationError] = useState<string | null>(null)

	const [createWorldEventTrack, { isLoading }] = useCreateWorldEventTrackMutation()

	const worldId = useSelector(getWorldIdState)

	useEffect(() => {
		setNameValidationError(null)
	}, [name])

	useModalCleanup({
		isOpen,
		onCleanup: () => {
			setName('')
			setAssignOrphans(false)
			setNameValidationError(null)
		},
	})

	const onConfirm = async () => {
		if (!isOpen) {
			return
		}

		const validationResult = isEntityNameValid(name)
		if (validationResult.error) {
			setNameValidationError(validationResult.error)
			return
		}

		const { error } = parseApiResponse(
			await createWorldEventTrack({
				worldId,
				body: {
					name: name.trim(),
					assignOrphans,
				},
			}),
		)
		if (error) {
			setNameValidationError(error.message)
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
		<Modal visible={isOpen} onClose={close} closeOnBackdropClick>
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
			<FormGroup>
				<FormControlLabel
					control={<Checkbox checked={assignOrphans} onChange={(_, checked) => setAssignOrphans(checked)} />}
					label="Assign orphan events to new track"
				/>
			</FormGroup>
			<ModalFooter>
				<Tooltip title={shortcutLabel} arrow placement="top">
					<Button
						loading={isLoading}
						variant="contained"
						onClick={onConfirm}
						loadingPosition="start"
						startIcon={<Add />}
					>
						<span>Create</span>
					</Button>
				</Tooltip>
				<Button variant="outlined" onClick={close}>
					Cancel
				</Button>
			</ModalFooter>
		</Modal>
	)
}
