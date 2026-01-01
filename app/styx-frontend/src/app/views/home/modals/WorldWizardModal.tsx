import { WorldCalendarType } from '@api/types/worldTypes'
import { useCreateWorldMutation } from '@api/worldListApi'
import Add from '@mui/icons-material/Add'
import Button from '@mui/material/Button'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import { useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'

import { useModal } from '@/app/features/modals/ModalsSlice'
import { TimestampField } from '@/app/features/time/components/TimestampField'
import { useWorldCalendar } from '@/app/features/time/hooks/useWorldCalendar'
import { Shortcut, useShortcut } from '@/app/hooks/useShortcut/useShortcut'
import { isEntityNameValid } from '@/app/utils/isEntityNameValid'
import { parseApiResponse } from '@/app/utils/parseApiResponse'
import { worldSlice } from '@/app/views/world/WorldSlice'
import Modal, { ModalFooter, ModalHeader, useModalCleanup } from '@/ui-lib/components/Modal'

export const WorldWizardModal = () => {
	const [name, setName] = useState('')
	const [description, setDescription] = useState('')
	const [calendar, setCalendar] = useState<WorldCalendarType>('EARTH')
	const [timeOrigin, setTimeOrigin] = useState<number>(0)
	const [nameValidationError, setNameValidationError] = useState<string | null>(null)

	const { listAllCalendars } = useWorldCalendar()

	const { isOpen, close } = useModal('worldWizardModal')
	const navigate = useNavigate()

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
			setCalendar('EARTH')
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
					calendar,
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
			<Modal visible={isOpen} onClose={close}>
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
				<FormControl fullWidth>
					<InputLabel id="world-calendar-label">Calendar</InputLabel>
					<Select
						value={calendar}
						label="Calendar"
						labelId="world-calendar-label"
						onChange={(event) => {
							setTimeOrigin(0)
							setCalendar(event.target.value as WorldCalendarType)
						}}
					>
						{listAllCalendars().map((option) => (
							<MenuItem key={option.id} value={option.id}>
								{option.displayName}
							</MenuItem>
						))}
					</Select>
				</FormControl>
				<TimestampField
					timestamp={timeOrigin}
					onChange={setTimeOrigin}
					label="Time Origin"
					calendar={calendar}
				/>
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
