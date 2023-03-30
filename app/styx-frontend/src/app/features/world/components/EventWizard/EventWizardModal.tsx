import { Add } from '@mui/icons-material'
import { Button, TextField, Tooltip } from '@mui/material'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { Shortcut, useShortcut } from '../../../../../hooks/useShortcut'
import { useModalCleanup } from '../../../../../ui-lib/components/Modal'
import Modal from '../../../../../ui-lib/components/Modal/Modal'
import { ModalHeader } from '../../../../../ui-lib/components/Modal/styles'
import { useWorldTime } from '../../../time/hooks/useWorldTime'
import { makeStoryEvent } from '../../creators'
import { worldSlice } from '../../reducer'
import { useWorldRouter } from '../../router'
import { getEventWizardState } from '../../selectors'

export const EventWizardModal = () => {
	const [name, setName] = useState('')
	const [nameValidationError, setNameValidationError] = useState<string | null>(null)

	const { isOpen, timestamp } = useSelector(getEventWizardState)

	const dispatch = useDispatch()
	const { createWorldEvent, closeEventWizard } = worldSlice.actions

	const { timeToLabel } = useWorldTime()
	const { navigateToEventEditor } = useWorldRouter()

	useEffect(() => {
		setNameValidationError(null)
	}, [name])

	useModalCleanup({
		isOpen,
		onCleanup: () => {
			setName('')
			setNameValidationError(null)
		},
	})

	const onConfirm = () => {
		if (!isOpen) {
			return
		}

		if (!name.trim()) {
			setNameValidationError("Field can't be empty")
			return
		}

		const newEvent = makeStoryEvent({
			name: name.trim(),
			timestamp,
		})
		dispatch(createWorldEvent(newEvent))
		dispatch(closeEventWizard())
		navigateToEventEditor(newEvent)
	}

	const { largeLabel: shortcutLabel } = useShortcut(Shortcut.CtrlEnter, () => {
		onConfirm()
	})

	return (
		<Modal visible={isOpen} onClose={() => dispatch(closeEventWizard())}>
			<ModalHeader>Create new event</ModalHeader>
			<TextField label="Timestamp" type="text" value={timeToLabel(timestamp)} disabled />
			<TextField
				label="Name"
				type="text"
				value={name}
				onChange={(event) => setName(event.target.value)}
				error={!!nameValidationError}
				helperText={nameValidationError}
				autoFocus
			/>
			<Tooltip title={shortcutLabel} arrow placement="top">
				<Button variant="outlined" onClick={onConfirm}>
					<Add /> Create
				</Button>
			</Tooltip>
		</Modal>
	)
}
