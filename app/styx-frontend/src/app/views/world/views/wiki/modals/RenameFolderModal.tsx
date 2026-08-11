import Save from '@mui/icons-material/Save'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import { useEffect, useState } from 'react'

import { useModal } from '@/app/features/modals/ModalsSlice'
import { Shortcut, useShortcut } from '@/app/hooks/useShortcut/useShortcut'
import { isEntityNameValid } from '@/app/utils/isEntityNameValid'
import { useUpdateFolder } from '@/app/views/world/api/useUpdateFolder'
import Modal, { ModalFooter, ModalHeader, useModalPrefill } from '@/ui-lib/components/Modal'

export function RenameFolderModal() {
	const { isOpen, close, folderId, folderName } = useModal('renameFolderModal')

	const [name, setName] = useState(folderName)
	const [nameValidationError, setNameValidationError] = useState<string | null>(null)

	const [updateFolder] = useUpdateFolder()

	useEffect(() => {
		setNameValidationError(null)
	}, [name])

	useModalPrefill({
		isOpen,
		onPrefill: () => {
			setName(folderName)
			setNameValidationError(null)
		},
	})

	const onConfirm = () => {
		if (!isOpen) {
			return
		}

		const validationResult = isEntityNameValid(name)
		if (validationResult.error) {
			setNameValidationError(validationResult.error)
			return
		}

		updateFolder(folderId, { name })
		close()
	}

	const onCloseAttempt = () => {
		close()
	}

	const { largeLabel: shortcutLabel } = useShortcut([Shortcut.Enter, Shortcut.CtrlEnter], onConfirm, isOpen)

	return (
		<Modal visible={isOpen} onClose={onCloseAttempt}>
			<ModalHeader>Rename folder</ModalHeader>
			<TextField
				label="Name"
				type="text"
				value={name}
				onChange={(event) => setName(event.target.value)}
				onFocus={(event) => event.target.select()}
				error={!!nameValidationError}
				helperText={nameValidationError}
				autoFocus
			/>
			<ModalFooter>
				<Tooltip title={shortcutLabel} arrow placement="top">
					<Button variant="contained" onClick={onConfirm} startIcon={<Save />}>
						Rename
					</Button>
				</Tooltip>
				<Button variant="outlined" onClick={onCloseAttempt}>
					Cancel
				</Button>
			</ModalFooter>
		</Modal>
	)
}
