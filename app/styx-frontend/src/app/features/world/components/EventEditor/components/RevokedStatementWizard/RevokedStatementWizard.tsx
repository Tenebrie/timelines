import { Add } from '@mui/icons-material'
import { LoadingButton } from '@mui/lab'
import { Autocomplete, Button, Collapse, List, ListItem, TextField, Tooltip, Typography } from '@mui/material'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { TransitionGroup } from 'react-transition-group'

import { useRevokeWorldEventMutation } from '../../../../../../../api/rheaApi'
import { Shortcut, useShortcut } from '../../../../../../../hooks/useShortcut'
import { ModalFooter, ModalHeader, useModalCleanup } from '../../../../../../../ui-lib/components/Modal'
import Modal from '../../../../../../../ui-lib/components/Modal/Modal'
import { parseApiResponse } from '../../../../../../utils/parseApiResponse'
import { getOutlinerPreferences } from '../../../../../preferences/selectors'
import { useWorldTime } from '../../../../../time/hooks/useWorldTime'
import { worldSlice } from '../../../../reducer'
import { useWorldRouter } from '../../../../router'
import { getRevokedStatementWizardState, getWorldState } from '../../../../selectors'
import { EventHeaderRenderer } from '../../../Renderers/Event/EventHeaderRenderer'
import { EventWithContentRenderer } from '../../../Renderers/Event/EventWithContentRenderer'

export const RevokedStatementWizard = () => {
	const { isOpen, preselectedEventId } = useSelector(getRevokedStatementWizardState)

	const [id, setId] = useState('')
	const [inputValue, setInputValue] = useState('')

	const { events: worldEvents, selectedEvents } = useSelector(getWorldState)
	const { collapsedEvents } = useSelector(getOutlinerPreferences)

	const { worldParams, selectedTime } = useWorldRouter()
	const [revokeWorldStatement, { isLoading }] = useRevokeWorldEventMutation()
	const { timeToLabel } = useWorldTime()

	const dispatch = useDispatch()
	const { closeRevokedStatementWizard } = worldSlice.actions

	useModalCleanup({
		isOpen,
		onCleanup: () => {
			setId('')

			if (preselectedEventId) {
				setId(preselectedEventId)
				return
			}

			if (selectedEvents.length !== 1) {
				return
			}

			const event = worldEvents.find((e) => e.id === selectedEvents[0])
			if (!event || event.revokedAt) {
				return
			}

			setId(event.id)
		},
	})

	const onConfirm = async () => {
		if (!isOpen) {
			return
		}

		const { error } = parseApiResponse(
			await revokeWorldStatement({
				worldId: worldParams.worldId,
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

	const removableCards = worldEvents
		.filter((event) => event.revokedAt === undefined && event.timestamp < selectedTime)
		.sort((a, b) => a.timestamp - b.timestamp)

	const options = removableCards.map((card) => ({
		card,
		label: card.name,
	}))
	const previewOption = options.find((option) => option.card.id === id)

	return (
		<Modal visible={isOpen} onClose={onCloseAttempt}>
			<ModalHeader>Revoke Statement</ModalHeader>

			<Typography>
				<b>Timestamp:</b> {timeToLabel(selectedTime)}
			</Typography>
			{removableCards.length > 0 && (
				<Autocomplete
					value={options.find((option) => option.card.id === id) ?? null}
					isOptionEqualToValue={(option, value) => option.card.id === value.card.id}
					onChange={(_, newValue) => setId(newValue?.card.id ?? '')}
					inputValue={inputValue}
					onInputChange={(event, newInputValue) => {
						setInputValue(newInputValue)
					}}
					autoHighlight
					options={options}
					data-hj-suppress
					renderOption={(props, option) => (
						<ListItem key={option.card.id} {...props}>
							<EventHeaderRenderer event={option.card} owningActor={null} short={true} active />
						</ListItem>
					)}
					renderInput={(params) => <TextField {...params} label="Statement to revoke" />}
				/>
			)}
			{removableCards.length === 0 && (
				<TextField label="Statement to revoke" disabled value="No statements available!" />
			)}
			<TransitionGroup style={{ marginBottom: '-16px' }}>
				{previewOption && (
					<Collapse key={previewOption.card.id} in>
						<List sx={{ bgcolor: 'rgba(0, 0, 0, 0.3)', borderRadius: 1 }} style={{ marginBottom: '16px' }}>
							<EventWithContentRenderer
								event={previewOption.card}
								owningActor={null}
								short
								active
								divider={false}
								collapsed={collapsedEvents.includes(previewOption.card.id)}
								actions={['collapse']}
							/>
						</List>
					</Collapse>
				)}
			</TransitionGroup>
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
