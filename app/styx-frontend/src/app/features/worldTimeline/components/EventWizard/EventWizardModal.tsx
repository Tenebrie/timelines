// @ts-nocheck
import Add from '@mui/icons-material/Add'
import LoadingButton from '@mui/lab/LoadingButton'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import { useNavigate, useParams } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

import { useCreateWorldEventMutation } from '@/api/worldEventApi'
import { useModal } from '@/app/features/modals/reducer'
import { TimestampField } from '@/app/features/time/components/TimestampField'
import { isEntityNameValid } from '@/app/features/validation/isEntityNameValid'
import { Shortcut, useShortcut } from '@/app/hooks/useShortcut'
import { parseApiResponse } from '@/app/utils/parseApiResponse'
import Modal, { useModalCleanup } from '@/ui-lib/components/Modal'
import { ModalFooter, ModalHeader } from '@/ui-lib/components/Modal'

export const EventWizardModal = () => {
	const { isOpen, timestamp: initialTimestamp, close } = useModal('eventWizard')

	const [name, setName] = useState('')
	const [timestamp, setTimestamp] = useState(initialTimestamp)
	const [nameValidationError, setNameValidationError] = useState<string | null>(null)

	const [createWorldEvent, { isLoading }] = useCreateWorldEventMutation()

	const navigate = useNavigate({ from: '/world/$worldId' })
	const { worldId } = useParams({ from: '/world/$worldId' })

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

		const validationResult = isEntityNameValid(name)
		if (validationResult.error) {
			setNameValidationError(validationResult.error)
			return
		}

		const { response, error } = parseApiResponse(
			await createWorldEvent({
				worldId,
				body: {
					type: 'SCENE',
					name: name.trim(),
					timestamp: String(timestamp),
				},
			}),
		)
		if (error) {
			setNameValidationError(error.message)
			return
		}

		close()
		navigate({
			to: '/world/$worldId/timeline/event/$eventId',
			params: { eventId: response.id },
			search: { time: timestamp },
		})
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
