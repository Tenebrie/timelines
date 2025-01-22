import Add from '@mui/icons-material/Add'
import LoadingButton from '@mui/lab/LoadingButton'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import { useEffect, useState } from 'react'

import { Shortcut, useShortcut } from '@/hooks/useShortcut'
import { useWorldWikiRouter, worldWikiRoutes } from '@/router/routes/featureRoutes/worldWikiRoutes'
import Modal, { ModalFooter, ModalHeader, useModalCleanup } from '@/ui-lib/components/Modal'

import { useModal } from '../../modals/reducer'
import { isEntityNameValid } from '../../validation/isEntityNameValid'
import { useCreateArticle } from '../api/useCreateArticle'

export const ArticleWizardModal = () => {
	const { isOpen, close } = useModal('articleWizard')

	const [name, setName] = useState('')
	const [nameValidationError, setNameValidationError] = useState<string | null>(null)

	const [createArticle, { isLoading }] = useCreateArticle()
	const { navigateTo } = useWorldWikiRouter()

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

	const onConfirm = async () => {
		if (!isOpen) {
			return
		}

		const validationResult = isEntityNameValid(name)
		if (validationResult.error) {
			setNameValidationError(validationResult.error)
			return
		}

		const response = await createArticle({ name })
		close()

		if (response) {
			setTimeout(() => {
				navigateTo({
					target: worldWikiRoutes.article,
					args: {
						worldId: response.worldId,
						articleId: response.id,
					},
				})
			}, 100)
		}
	}

	const { largeLabel: shortcutLabel } = useShortcut([Shortcut.Enter, Shortcut.CtrlEnter], onConfirm, isOpen)

	return (
		<Modal visible={isOpen} onClose={close}>
			<ModalHeader>Create new article</ModalHeader>
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
							<span>Create</span>
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