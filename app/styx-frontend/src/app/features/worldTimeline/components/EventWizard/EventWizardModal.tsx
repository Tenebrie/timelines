import { Add } from '@mui/icons-material'
import { LoadingButton } from '@mui/lab'
import { Button, TextField, Tooltip } from '@mui/material'
import { useEffect, useState } from 'react'

import { useCreateWorldEventMutation } from '@/api/worldEventApi'
import { useModal } from '@/app/features/modals/reducer'
import { TimestampField } from '@/app/features/time/components/TimestampField'
import { parseApiResponse } from '@/app/utils/parseApiResponse'
import { Shortcut, useShortcut } from '@/hooks/useShortcut'
import { useWorldTimelineRouter, worldTimelineRoutes } from '@/router/routes/worldTimelineRoutes'
import Modal, { useModalCleanup } from '@/ui-lib/components/Modal'
import { ModalFooter, ModalHeader } from '@/ui-lib/components/Modal'

export const EventWizardModal = () => {
	const { isOpen, timestamp: initialTimestamp, close } = useModal('eventWizard')

	const [name, setName] = useState('')
	const [timestamp, setTimestamp] = useState(initialTimestamp)
	const [nameValidationError, setNameValidationError] = useState<string | null>(null)

	const [createWorldEvent, { isLoading }] = useCreateWorldEventMutation()

	const { navigateToEventEditor, stateOf } = useWorldTimelineRouter()
	const { worldId } = stateOf(worldTimelineRoutes.eventEditor)

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
					descriptionRich: '',
					mentionedActorIds: [],
					timestamp: String(timestamp),
					revokedAt: null,
					customNameEnabled: false,
					modules: [],
					icon: 'default',
					externalLink: '',
				},
			}),
		)
		if (error) {
			setNameValidationError(error.message)
			return
		}

		close()
		navigateToEventEditor({ eventId: response.id, selectedTime: timestamp })
	}

	const { largeLabel: shortcutLabel } = useShortcut(
		Shortcut.CtrlEnter,
		() => {
			onConfirm()
		},
		isOpen ? 1 : -1,
	)

	return (
		<Modal visible={isOpen} onClose={close}>
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
				<Button variant="outlined" onClick={close}>
					Cancel
				</Button>
			</ModalFooter>
		</Modal>
	)
}
