import { Add } from '@mui/icons-material'
import { LoadingButton } from '@mui/lab'
import { Button, FormControl, InputLabel, MenuItem, Select, TextField, Tooltip } from '@mui/material'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { useRevokeWorldEventMutation } from '../../../../../../../api/rheaApi'
import { Shortcut, useShortcut } from '../../../../../../../hooks/useShortcut'
import { ModalFooter, ModalHeader, useModalCleanup } from '../../../../../../../ui-lib/components/Modal'
import Modal from '../../../../../../../ui-lib/components/Modal/Modal'
import { parseApiResponse } from '../../../../../../utils/parseApiResponse'
import { worldSlice } from '../../../../reducer'
import { useWorldRouter } from '../../../../router'
import { getRevokedStatementWizardState, getWorldState } from '../../../../selectors'
import { EventRenderer } from '../../../Renderers/Event/EventRenderer'

export const RevokedStatementWizard = () => {
	const [id, setId] = useState('')

	const { events: worldEvents } = useSelector(getWorldState)

	const { eventEditorParams, selectedTime } = useWorldRouter()
	const [revokeWorldStatement, { isLoading }] = useRevokeWorldEventMutation()

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

		const { error } = parseApiResponse(
			await revokeWorldStatement({
				worldId: eventEditorParams.worldId,
				eventId: id,
				body: { revokedAt: String(selectedTime) },
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
		.filter((event) => event.revokedAt === undefined && event.timestamp < editorEvent.timestamp)
		.sort((a, b) => a.timestamp - b.timestamp)

	return (
		<Modal visible={isOpen} onClose={onCloseAttempt}>
			<ModalHeader>Revoke Statement</ModalHeader>

			{removableCards.length > 0 && (
				<FormControl fullWidth>
					<InputLabel id="revoked-statement-label">Statement to revoke</InputLabel>
					<Select
						value={id}
						label="Statement to revoke"
						labelId="revoked-statement-label"
						onChange={(event) => setId(event.target.value)}
						data-hj-suppress
					>
						{removableCards.map((card, index) => (
							<MenuItem key={card.id} value={card.id}>
								<EventRenderer
									event={card}
									owningActor={null}
									collapsed={false}
									highlighted={false}
									index={index}
									short={true}
									active
								/>
							</MenuItem>
						))}
					</Select>
				</FormControl>
			)}
			{removableCards.length === 0 && (
				<TextField label="Statement to revoke" disabled value="No statements available!" />
			)}
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
