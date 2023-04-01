import { Add } from '@mui/icons-material'
import { LoadingButton } from '@mui/lab'
import { Button, FormControl, InputLabel, MenuItem, Select, Tooltip } from '@mui/material'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { useRevokeWorldStatementMutation } from '../../../../../../../api/rheaApi'
import { Shortcut, useShortcut } from '../../../../../../../hooks/useShortcut'
import { ModalFooter, ModalHeader, useModalCleanup } from '../../../../../../../ui-lib/components/Modal'
import Modal from '../../../../../../../ui-lib/components/Modal/Modal'
import { parseApiResponse } from '../../../../../../utils/parseApiResponse'
import { worldSlice } from '../../../../reducer'
import { useWorldRouter } from '../../../../router'
import { getRevokedStatementWizardState, getWorldState } from '../../../../selectors'

export const RevokedStatementWizard = () => {
	const [id, setId] = useState('')

	const { events: worldEvents } = useSelector(getWorldState)

	const { eventEditorParams } = useWorldRouter()
	const [revokeWorldStatement, { isLoading }] = useRevokeWorldStatementMutation()

	const dispatch = useDispatch()
	const { closeRevokedStatementWizard } = worldSlice.actions

	const { isOpen } = useSelector(getRevokedStatementWizardState)

	useModalCleanup({
		isOpen,
		onCleanup: () => {
			setId('')
		},
	})

	const onConfirm = async () => {
		if (!isOpen) {
			return
		}

		const { response, error } = parseApiResponse(
			await revokeWorldStatement({
				worldId: eventEditorParams.worldId,
				statementId: id,
				body: { eventId: eventEditorParams.eventId },
			})
		)
		if (error) {
			return
		}
		dispatch(closeRevokedStatementWizard())
	}

	const onCloseAttempt = () => {
		if (isLoading) {
			return
		}
		dispatch(closeRevokedStatementWizard())
	}

	const { largeLabel: shortcutLabel } = useShortcut(Shortcut.CtrlEnter, () => {
		onConfirm()
	})

	const editorEvent = worldEvents.find((event) => event.id === eventEditorParams.eventId)

	if (!editorEvent) {
		return <></>
	}

	const removableCards = worldEvents
		.filter((event) => event.timestamp < editorEvent.timestamp)
		.filter((event) => editorEvent.revokedStatements.every((revokedEvent) => revokedEvent.id === event.id))
		.flatMap((event) =>
			event.issuedStatements.map((statement) => ({
				...statement,
				event,
			}))
		)

	return (
		<Modal visible={isOpen} onClose={onCloseAttempt}>
			<ModalHeader>New Revoked Statement</ModalHeader>
			<FormControl fullWidth>
				<InputLabel id="demo-simple-select-label">Statement to revoke</InputLabel>
				<Select
					value={id}
					label="Statement to revoke"
					labelId="demo-simple-select-label"
					onChange={(event) => setId(event.target.value)}
				>
					{removableCards.map((card) => (
						<MenuItem key={card.id} value={card.id}>
							{card.event.name} / {card.title}
						</MenuItem>
					))}
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
				<Button variant="outlined" onClick={onCloseAttempt}>
					Cancel
				</Button>
			</ModalFooter>
		</Modal>
	)
}
