import Add from '@mui/icons-material/Add'
import LoadingButton from '@mui/lab/LoadingButton'
import Button from '@mui/material/Button'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import { useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

import { useCreateActorMutation } from '@/api/actorListApi'
import { FormErrorBanner } from '@/app/components/FormErrorBanner'
import { useModal } from '@/app/features/modals/reducer'
import { isEntityNameValid } from '@/app/features/validation/isEntityNameValid'
import { getWorldIdState } from '@/app/features/world/selectors'
import { Shortcut, useShortcut } from '@/app/hooks/useShortcut'
import { parseApiResponse } from '@/app/utils/parseApiResponse'
import { useErrorState } from '@/app/utils/useErrorState'
import Modal, { useModalCleanup } from '@/ui-lib/components/Modal'
import { ModalFooter, ModalHeader } from '@/ui-lib/components/Modal'

import { useActorColors } from '../../hooks/useActorColors'

export const ActorWizardModal = () => {
	const { isOpen, close } = useModal('actorWizard')
	const { getColorOptions, renderOption, renderValue } = useActorColors()

	const [name, setName] = useState('')
	const [title, setTitle] = useState('')
	const [color, setColor] = useState<string>(getColorOptions()[0].value)

	const { error, raiseError, clearError, errorState } = useErrorState<{
		MISSING_NAME: string
		SERVER_SIDE_ERROR: string
	}>()

	const [createActor, { isLoading }] = useCreateActorMutation()

	const navigate = useNavigate({ from: '/world/$worldId' })
	const worldId = useSelector(getWorldIdState)

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

		const validationResult = isEntityNameValid(name)
		if (validationResult.error) {
			raiseError('MISSING_NAME', validationResult.error)
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
			}),
		)
		if (error) {
			raiseError('SERVER_SIDE_ERROR', error.message)
			return
		}

		close()
		navigate({
			to: '/world/$worldId/mindmap',
			search: true,
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
				<Button variant="outlined" onClick={close}>
					Cancel
				</Button>
			</ModalFooter>
		</Modal>
	)
}
