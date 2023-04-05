import { Add } from '@mui/icons-material'
import { LoadingButton } from '@mui/lab'
import { Button, TextField, Tooltip } from '@mui/material'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { useIssueWorldStatementMutation } from '../../../../../../../api/rheaApi'
import { Shortcut, useShortcut } from '../../../../../../../hooks/useShortcut'
import { ModalFooter, useModalCleanup } from '../../../../../../../ui-lib/components/Modal'
import Modal from '../../../../../../../ui-lib/components/Modal/Modal'
import { ModalHeader } from '../../../../../../../ui-lib/components/Modal/styles'
import { parseApiResponse } from '../../../../../../utils/parseApiResponse'
import { worldSlice } from '../../../../reducer'
import { useWorldRouter } from '../../../../router'
import { getIssuedStatementWizardState } from '../../../../selectors'

export const IssuedStatementWizard = () => {
	const hasEditedTitle = useRef<boolean>(false)
	const [title, setTitle] = useState('')
	const [content, setContent] = useState('')
	const [titleValidationError, setTitleValidationError] = useState<string | null>(null)

	const { eventEditorParams } = useWorldRouter()
	const [issueWorldStatement, { isLoading }] = useIssueWorldStatementMutation()

	const dispatch = useDispatch()
	const { closeIssuedStatementWizard } = worldSlice.actions

	const { isOpen } = useSelector(getIssuedStatementWizardState)

	useModalCleanup({
		isOpen,
		onCleanup: () => {
			setTitle('')
			setContent('')
			setTitleValidationError(null)
		},
	})

	useEffect(() => {
		setTitleValidationError(null)
	}, [title, content])

	const onChangeTitle = useCallback((value: string) => {
		setTitle(value)
		hasEditedTitle.current = true
	}, [])

	const onChangeContent = useCallback((value: string) => {
		if (!hasEditedTitle.current) {
			const indexOfDot = value.indexOf('.')
			setTitle(value.substring(0, indexOfDot > 0 ? indexOfDot : value.length))
		}
		setContent(value)
	}, [])

	const onConfirm = async () => {
		if (!isOpen) {
			return
		}

		const { error } = parseApiResponse(
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
		dispatch(closeIssuedStatementWizard())
	}

	const onCloseAttempt = () => {
		if (isLoading) {
			return
		}
		dispatch(closeIssuedStatementWizard())
	}

	const { largeLabel: shortcutLabel } = useShortcut(Shortcut.CtrlEnter, () => {
		onConfirm()
	})

	return (
		<Modal visible={isOpen} onClose={onCloseAttempt}>
			<ModalHeader>New Issued Statement</ModalHeader>
			<TextField
				value={content}
				onChange={(e) => onChangeContent(e.target.value)}
				type={'text'}
				label="Content"
				multiline
				autoFocus
				minRows={3}
				error={!!titleValidationError}
				helperText={titleValidationError}
				inputProps={{ maxLength: 256 }}
			/>
			<TextField
				label="Title"
				type="text"
				value={title}
				onChange={(event) => onChangeTitle(event.target.value)}
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
				<Button variant="outlined" onClick={onCloseAttempt}>
					Cancel
				</Button>
			</ModalFooter>
		</Modal>
	)
}
