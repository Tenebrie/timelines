import { Add } from '@mui/icons-material'
import { LoadingButton } from '@mui/lab'
import { Button, TextField, Tooltip } from '@mui/material'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { useCreateWorldMutation } from '../../../../api/rheaApi'
import { Shortcut, useShortcut } from '../../../../hooks/useShortcut'
import Modal, { ModalFooter, ModalHeader, useModalCleanup } from '../../../../ui-lib/components/Modal'
import { parseApiResponse } from '../../../utils/parseApiResponse'
import { useWorldRouter } from '../../world/router'
import { worldListSlice } from '../reducer'
import { getWorldWizardModalState } from '../selectors'

export const WorldWizardModal = () => {
	const [name, setName] = useState('')
	const [nameValidationError, setNameValidationError] = useState<string | null>(null)

	const { isOpen } = useSelector(getWorldWizardModalState)

	const { navigateToWorld: navigateToWorldRoot } = useWorldRouter()

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
				},
			})
		)
		if (error) {
			setNameValidationError(error.message)
			return
		}

		dispatch(closeWorldWizardModal())
		navigateToWorldRoot(response.id)
	}

	const { largeLabel: shortcutLabel } = useShortcut(Shortcut.Enter, () => {
		onConfirm()
	})

	return (
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
	)
}
