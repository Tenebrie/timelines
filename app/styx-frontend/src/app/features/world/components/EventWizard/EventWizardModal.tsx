import { Add } from '@mui/icons-material'
import { LoadingButton } from '@mui/lab'
import { Button, TextField, Tooltip } from '@mui/material'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { useCreateWorldEventMutation } from '../../../../../api/rheaApi'
import { Shortcut, useShortcut } from '../../../../../hooks/useShortcut'
import { useWorldRouter, worldRoutes } from '../../../../../router/routes/worldRoutes'
import Modal, { useModalCleanup } from '../../../../../ui-lib/components/Modal'
import { ModalFooter, ModalHeader } from '../../../../../ui-lib/components/Modal'
import { parseApiResponse } from '../../../../utils/parseApiResponse'
import { TimestampField } from '../../../time/components/TimestampField'
import { worldSlice } from '../../reducer'
import { getEventWizardState } from '../../selectors'

export const EventWizardModal = () => {
	const { isOpen, timestamp: initialTimestamp } = useSelector(getEventWizardState)

	const [name, setName] = useState('')
	const [timestamp, setTimestamp] = useState(initialTimestamp)
	const [nameValidationError, setNameValidationError] = useState<string | null>(null)

	const dispatch = useDispatch()
	const { closeEventWizard } = worldSlice.actions

	const [createWorldEvent, { isLoading }] = useCreateWorldEventMutation()

	const { navigateToEventEditor, stateOf } = useWorldRouter()
	const { worldId } = stateOf(worldRoutes.eventEditor)

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
				worldId,
				body: {
					type: 'SCENE',
					name: name.trim(),
					description: '',
					targetActorIds: [],
					mentionedActorIds: [],
					timestamp: String(timestamp),
					revokedAt: String(''),
					customNameEnabled: false,
					modules: [],
					icon: 'default',
				},
			}),
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
			<TimestampField label="Timestamp" timestamp={timestamp} onChange={(value) => setTimestamp(value)} />
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
