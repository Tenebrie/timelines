import { useCreateWorldMutation } from '@api/worldListApi'
import Add from '@mui/icons-material/Add'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'

import { useModal } from '@/app/features/modals/ModalsSlice'
import { CalendarSelector } from '@/app/features/time/calendar/components/CalendarSelector'
import { Shortcut, useShortcut } from '@/app/hooks/useShortcut/useShortcut'
import { isEntityNameValid } from '@/app/utils/isEntityNameValid'
import { parseApiResponse } from '@/app/utils/parseApiResponse'
import { worldSlice } from '@/app/views/world/WorldSlice'
import { useStableNavigate } from '@/router-utils/hooks/useStableNavigate'
import Modal, { ModalFooter, ModalHeader, useModalCleanup } from '@/ui-lib/components/Modal'

export const WorldWizardModal = () => {
	const [name, setName] = useState('')
	const [description, setDescription] = useState('')
	const [calendars, setCalendars] = useState<string[]>([])
	const [timeOrigin, setTimeOrigin] = useState<number>(0)
	const [nameValidationError, setNameValidationError] = useState<string | null>(null)

	// const { listAllCalendars } = useWorldCalendar()

	const { isOpen, close } = useModal('worldWizardModal')
	const navigate = useStableNavigate()

	const [createWorld, { isLoading }] = useCreateWorldMutation()

	const dispatch = useDispatch()
	const { unloadWorld } = worldSlice.actions

	useEffect(() => {
		setNameValidationError(null)
	}, [name])

	useModalCleanup({
		isOpen,
		onCleanup: () => {
			setName('')
			setDescription('')
			setCalendars([])
			setTimeOrigin(0)
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
			await createWorld({
				body: {
					name,
					description,
					calendars,
					timeOrigin,
				},
			}),
		)
		if (error) {
			setNameValidationError(error.message)
			return
		}

		close()
		dispatch(unloadWorld())
		navigate({
			to: '/world/$worldId/timeline',
			params: { worldId: response.id },
			search: (prev) => ({ ...prev, time: timeOrigin }),
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
		<>
			<Modal visible={isOpen} onClose={close} closeOnBackdropClick>
				<ModalHeader>Create world</ModalHeader>
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
					label="Description"
					type="text"
					value={description}
					onChange={(event) => setDescription(event.target.value)}
				/>
				<CalendarSelector value={'earth_current'} onChange={(value) => setCalendars([value])} />
				<ModalFooter>
					<Tooltip title={shortcutLabel} arrow placement="top">
						<Button
							loading={isLoading}
							variant="contained"
							onClick={onConfirm}
							loadingPosition="start"
							startIcon={<Add />}
						>
							<span>Confirm</span>
						</Button>
					</Tooltip>
					<Button variant="outlined" onClick={close}>
						Cancel
					</Button>
				</ModalFooter>
			</Modal>
		</>
	)
}
