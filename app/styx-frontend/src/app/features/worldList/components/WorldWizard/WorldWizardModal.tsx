import { useCreateWorldMutation } from '@api/worldListApi'
import { Add } from '@mui/icons-material'
import { LoadingButton } from '@mui/lab'
import { Button, FormControl, InputLabel, MenuItem, Select, TextField, Tooltip } from '@mui/material'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { TimestampField } from '@/app/features/time/components/TimestampField'
import { useWorldCalendar } from '@/app/features/time/hooks/useWorldCalendar'
import { WorldCalendarType } from '@/app/features/world/types'
import { parseApiResponse } from '@/app/utils/parseApiResponse'
import { Shortcut, useShortcut } from '@/hooks/useShortcut'
import { useWorldRouter, worldRoutes } from '@/router/routes/worldRoutes'
import Modal, { ModalFooter, ModalHeader, useModalCleanup } from '@/ui-lib/components/Modal'

import { worldListSlice } from '../../reducer'
import { getWorldWizardModalState } from '../../selectors'

export const WorldWizardModal = () => {
	const [name, setName] = useState('')
	const [calendar, setCalendar] = useState<WorldCalendarType>('EARTH')
	const [timeOrigin, setTimeOrigin] = useState<number>(0)
	const [nameValidationError, setNameValidationError] = useState<string | null>(null)

	const { listAllCalendars } = useWorldCalendar()

	const { isOpen } = useSelector(getWorldWizardModalState)

	const { navigateTo } = useWorldRouter()

	const [createWorld, { isLoading }] = useCreateWorldMutation()

	const dispatch = useDispatch()
	const { closeWorldWizardModal } = worldListSlice.actions

	useEffect(() => {
		setNameValidationError(null)
	}, [name])

	useModalCleanup({
		isOpen,
		onCleanup: () => {
			setName('')
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
			await createWorld({
				body: {
					name,
					calendar,
					timeOrigin,
				},
			}),
		)
		if (error) {
			setNameValidationError(error.message)
			return
		}

		dispatch(closeWorldWizardModal())
		navigateTo({
			target: worldRoutes.root,
			args: {
				worldId: response.id,
			},
		})
	}

	const { largeLabel: shortcutLabel } = useShortcut(Shortcut.CtrlEnter, () => {
		onConfirm()
	})

	return (
		<>
			<Modal visible={isOpen} onClose={() => dispatch(closeWorldWizardModal())}>
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
					<Button variant="outlined" onClick={() => dispatch(closeWorldWizardModal())}>
						Cancel
					</Button>
				</ModalFooter>
			</Modal>
		</>
	)
}
