import { Add } from '@mui/icons-material'
import { LoadingButton } from '@mui/lab'
import { Button, FormControl, InputLabel, Select, TextField, Tooltip } from '@mui/material'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { useCreateActorMutation } from '../../../../../api/rheaApi'
import { Shortcut, useShortcut } from '../../../../../hooks/useShortcut'
import { useWorldRouter, worldRoutes } from '../../../../../router/routes/worldRoutes'
import Modal, { useModalCleanup } from '../../../../../ui-lib/components/Modal'
import { ModalFooter, ModalHeader } from '../../../../../ui-lib/components/Modal'
import { FormErrorBanner } from '../../../../components/FormErrorBanner'
import { parseApiResponse } from '../../../../utils/parseApiResponse'
import { useErrorState } from '../../../../utils/useErrorState'
import { useActorColors } from '../../hooks/useActorColors'
import { worldSlice } from '../../reducer'
import { getActorWizardState } from '../../selectors'

export const ActorWizardModal = () => {
	const { isOpen } = useSelector(getActorWizardState)
	const { getColorOptions, renderOption, renderValue } = useActorColors()

	const [name, setName] = useState('')
	const [title, setTitle] = useState('')
	const [color, setColor] = useState<string>(getColorOptions()[0].value)

	const { error, raiseError, clearError, errorState } = useErrorState<{
		MISSING_NAME: string
		SERVER_SIDE_ERROR: string
	}>()

	const dispatch = useDispatch()
	const { closeActorWizard } = worldSlice.actions

	const [createActor, { isLoading }] = useCreateActorMutation()

	const { navigateToActorEditor, stateOf } = useWorldRouter()
	const { worldId } = stateOf(worldRoutes.root)

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
				worldId,
				body: {
					name: name.trim(),
					title: title.trim(),
					color: color,
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
			<FormErrorBanner errorState={errorState} />
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
			<FormControl fullWidth>
				<InputLabel id="actorColorSelectLabel">Color</InputLabel>
				<Select
					MenuProps={{ PaperProps: { sx: { maxHeight: 700 } } }}
					labelId="actorColorSelectLabel"
					value={color}
					onChange={(event) => setColor(event.target.value)}
					label="Color"
					renderValue={renderValue}
				>
					{getColorOptions().map((option) => renderOption(option))}
				</Select>
			</FormControl>
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
