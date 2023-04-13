import { Add } from '@mui/icons-material'
import { LoadingButton } from '@mui/lab'
import { Button, TextField, Tooltip } from '@mui/material'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { useCreateWorldEventMutation } from '../../../../../api/rheaApi'
import { Shortcut, useShortcut } from '../../../../../hooks/useShortcut'
import Modal, { useModalCleanup } from '../../../../../ui-lib/components/Modal'
import { ModalFooter, ModalHeader } from '../../../../../ui-lib/components/Modal'
import { parseApiResponse } from '../../../../utils/parseApiResponse'
import { worldSlice } from '../../reducer'
import { useWorldRouter } from '../../router'
import { getEventWizardState } from '../../selectors'
import { EventTimestampField } from '../EventEditor/components/EventTimestampField/EventTimestampField'

export const EventWizardModal = () => {
	const { isOpen, timestamp: initialTimestamp } = useSelector(getEventWizardState)

	const [name, setName] = useState('')
	const [timestamp, setTimestamp] = useState(initialTimestamp)
	const [nameValidationError, setNameValidationError] = useState<string | null>(null)

	const dispatch = useDispatch()
	const { closeEventWizard } = worldSlice.actions

	const [createWorldEvent, { isLoading }] = useCreateWorldEventMutation()

	const { navigateToEventEditor, worldParams } = useWorldRouter()

	useEffect(() => {
		setNameValidationError(null)
	}, [name])

	useModalCleanup({
		isOpen,
		onCleanup: () => {
			setName('')
			setTimestamp(initialTimestamp)
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

		const { response, error } = parseApiResponse(
			await createWorldEvent({
				worldId: worldParams.worldId,
				body: {
					name,
					type: 'SCENE',
					timestamp,
				},
			})
		)
		if (error) {
			setNameValidationError(error.message)
			return
		}

		dispatch(closeEventWizard())
		navigateToEventEditor(response.id)
	}

	const { largeLabel: shortcutLabel } = useShortcut(Shortcut.CtrlEnter, () => {
		onConfirm()
	})

	return (
		<Modal visible={isOpen} onClose={() => dispatch(closeEventWizard())}>
			<ModalHeader>Create new event</ModalHeader>
			<TextField
				label="Name"
				type="text"
				value={name}
				onChange={(event) => setName(event.target.value)}
				error={!!nameValidationError}
				helperText={nameValidationError}
				autoFocus
			/>
			<EventTimestampField
				label="Timestamp"
				timestamp={timestamp}
				onChange={(value) => setTimestamp(value)}
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
							<span>Confirm</span>
						</LoadingButton>
					</span>
				</Tooltip>
				<Button variant="outlined" onClick={() => dispatch(closeEventWizard())}>
					Cancel
				</Button>
			</ModalFooter>
		</Modal>
	)
}
