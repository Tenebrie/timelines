import { Add } from '@mui/icons-material'
import { LoadingButton } from '@mui/lab'
import { Button, TextField, Tooltip } from '@mui/material'
import { useState } from 'react'

import { useIssueWorldStatementMutation } from '../../../../../../../api/rheaApi'
import { Shortcut, useShortcut } from '../../../../../../../hooks/useShortcut'
import { ModalFooter, useModalCleanup } from '../../../../../../../ui-lib/components/Modal'
import Modal from '../../../../../../../ui-lib/components/Modal/Modal'
import { ModalHeader } from '../../../../../../../ui-lib/components/Modal/styles'
import { parseApiResponse } from '../../../../../../utils/parseApiResponse'
import { useWorldRouter } from '../../../../router'

type Props = {
	open: boolean
	onClose: () => void
}

export const IssuedStatementWizard = ({ open, onClose }: Props) => {
	const [title, setTitle] = useState('')
	const [content, setContent] = useState('')
	const [titleValidationError, setTitleValidationError] = useState<string | null>(null)

	const { eventEditorParams } = useWorldRouter()
	const [issueWorldStatement, { isLoading }] = useIssueWorldStatementMutation()

	useModalCleanup({
		isOpen: open,
		onCleanup: () => {
			setTitle('')
			setContent('')
		},
	})

	const onConfirm = async () => {
		if (!open) {
			return
		}

		const { response, error } = parseApiResponse(
			await issueWorldStatement({
				worldId: eventEditorParams.worldId,
				body: {
					title,
					content,
					eventId: eventEditorParams.eventId,
				},
			})
		)
		if (error) {
			setTitleValidationError(error.message)
			return
		}
		onClose()
	}

	const { largeLabel: shortcutLabel } = useShortcut(Shortcut.CtrlEnter, () => {
		onConfirm()
	})

	return (
		<Modal visible={open} onClose={onClose}>
			<ModalHeader>New Issued Statement</ModalHeader>
			<TextField
				label="Title"
				type="text"
				value={title}
				onChange={(event) => setTitle(event.target.value)}
				autoFocus
				error={!!titleValidationError}
				helperText={titleValidationError}
			/>
			<TextField
				value={content}
				onChange={(e) => setContent(e.target.value)}
				type={'text'}
				label="Content"
				multiline
				minRows={3}
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
				<Button variant="outlined" onClick={onClose}>
					Cancel
				</Button>
			</ModalFooter>
		</Modal>
	)
}
