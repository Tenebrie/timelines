import { Add } from '@mui/icons-material'
import { LoadingButton } from '@mui/lab'
import { Alert, Button, Collapse, TextField, Tooltip } from '@mui/material'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { TransitionGroup } from 'react-transition-group'

import { useCreateActorMutation } from '../../../../../api/rheaApi'
import { Shortcut, useShortcut } from '../../../../../hooks/useShortcut'
import Modal, { useModalCleanup } from '../../../../../ui-lib/components/Modal'
import { ModalFooter, ModalHeader } from '../../../../../ui-lib/components/Modal'
import { parseApiResponse } from '../../../../utils/parseApiResponse'
import { useErrorState } from '../../../../utils/useErrorState'
import { worldSlice } from '../../reducer'
import { useWorldRouter } from '../../router'
import { getActorWizardState } from '../../selectors'

export const ActorWizardModal = () => {
	const { isOpen } = useSelector(getActorWizardState)

	const [name, setName] = useState('')
	const [title, setTitle] = useState('')

	const { error, raiseError, clearError } = useErrorState<{
		MISSING_NAME: string
		SERVER_SIDE_ERROR: string
	}>()

	const dispatch = useDispatch()
	const { closeActorWizard } = worldSlice.actions

	const [createActor, { isLoading }] = useCreateActorMutation()

	const { navigateToActorEditor, worldParams } = useWorldRouter()

	useEffect(() => {
		clearError()
	}, [clearError, name, title])

	useModalCleanup({
		isOpen,
		onCleanup: () => {
			setName('')
			setTitle('')
			clearError()
		},
	})

	const onConfirm = async () => {
		if (!isOpen) {
			return
		}

		if (!name.trim()) {
			raiseError('MISSING_NAME', 'Field can not be empty')
			return
		}

		const { response, error } = parseApiResponse(
			await createActor({
				worldId: worldParams.worldId,
				body: {
					name: name.trim(),
					title: title.trim(),
				},
			})
		)
		if (error) {
			raiseError('SERVER_SIDE_ERROR', error.message)
			return
		}

		dispatch(closeActorWizard())
		navigateToActorEditor(response.id)
	}

	const { largeLabel: shortcutLabel } = useShortcut(Shortcut.CtrlEnter, () => {
		onConfirm()
	})

	return (
		<Modal visible={isOpen} onClose={() => dispatch(closeActorWizard())}>
			<ModalHeader>Create new actor</ModalHeader>
			<TransitionGroup>
				{error && (
					<Collapse>
						<Alert severity="error">{error.data}</Alert>
					</Collapse>
				)}
			</TransitionGroup>
			<TextField
				label="Name"
				type="text"
				value={name}
				onChange={(event) => setName(event.target.value)}
				error={!!error && error.type === 'MISSING_NAME'}
				autoFocus
			/>
			<TextField
				label="Title (optional)"
				type="text"
				value={title}
				onChange={(event) => setTitle(event.target.value)}
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
				<Button variant="outlined" onClick={() => dispatch(closeActorWizard())}>
					Cancel
				</Button>
			</ModalFooter>
		</Modal>
	)
}
