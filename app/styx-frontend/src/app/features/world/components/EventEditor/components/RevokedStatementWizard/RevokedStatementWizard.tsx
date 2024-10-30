import { Add } from '@mui/icons-material'
import { LoadingButton } from '@mui/lab'
import { Autocomplete, Button, Collapse, List, ListItem, TextField, Tooltip, Typography } from '@mui/material'
import { useCallback, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { TransitionGroup } from 'react-transition-group'

import { useRevokeWorldEventMutation } from '../../../../../../../api/rheaApi'
import { Shortcut, useShortcut } from '../../../../../../../hooks/useShortcut'
import { useWorldRouter, worldRoutes } from '../../../../../../../router/routes/worldRoutes'
import { ModalFooter, ModalHeader, useModalCleanup } from '../../../../../../../ui-lib/components/Modal'
import Modal from '../../../../../../../ui-lib/components/Modal/Modal'
import { useAutosave } from '../../../../../../utils/autosave/useAutosave'
import { parseApiResponse } from '../../../../../../utils/parseApiResponse'
import { getOutlinerPreferences } from '../../../../../preferences/selectors'
import { useWorldTime } from '../../../../../time/hooks/useWorldTime'
import { worldSlice } from '../../../../reducer'
import { getRevokedStatementWizardState, getWorldState } from '../../../../selectors'
import { EventHeaderRenderer } from '../../../Renderers/Event/EventHeaderRenderer'
import { EventWithContentRenderer } from '../../../Renderers/Event/EventWithContentRenderer'

export const RevokedStatementWizard = () => {
	const { isOpen, preselectedEventId } = useSelector(getRevokedStatementWizardState)

	const [id, setId] = useState('')
	const [inputValue, setInputValue] = useState('')

	const { events: worldEvents } = useSelector(getWorldState)
	const { expandedEvents } = useSelector(getOutlinerPreferences)

	const { stateOf, selectedTimeOrZero } = useWorldRouter()
	const { worldId } = stateOf(worldRoutes.eventEditor)
	const [revokeWorldStatement, { isLoading, isError, reset }] = useRevokeWorldEventMutation()
	const { timeToLabel } = useWorldTime()

	const dispatch = useDispatch()
	const { closeRevokedStatementWizard } = worldSlice.actions

	useModalCleanup({
		isOpen,
		onCleanup: () => {
			reset()
			if (!preselectedEventId) {
				setId('')
				return
			}

			setId(preselectedEventId)
		},
	})

	const sendRequest = useCallback(async () => {
		if (!isOpen) {
			return
		}

		const { error } = parseApiResponse(
			await revokeWorldStatement({
				worldId,
				eventId: id,
				body: { revokedAt: String(selectedTimeOrZero) },
			}),
		)
		if (error) {
			return
		}
		dispatch(closeRevokedStatementWizard())
	}, [closeRevokedStatementWizard, dispatch, id, isOpen, revokeWorldStatement, selectedTimeOrZero, worldId])

	const onCloseAttempt = () => {
		if (isLoading) {
			return
		}
		dispatch(closeRevokedStatementWizard())
	}

	const { largeLabel: shortcutLabel } = useShortcut(Shortcut.CtrlEnter, () => {
		sendRequest()
	})

	const removableCards = worldEvents
		.filter((event) => event.timestamp < selectedTimeOrZero)
		.sort((a, b) => a.timestamp - b.timestamp)

	const options = removableCards.map((card) => ({
		card,
		label: card.name,
	}))
	const previewOption = options.find((option) => option.card.id === id)

	const {
		icon,
		color: iconColor,
		manualSave: onConfirm,
	} = useAutosave({
		onSave: sendRequest,
		isSaving: isLoading,
		isError,
		defaultIcon: <Add />,
	})

	return (
		<Modal visible={isOpen} onClose={onCloseAttempt}>
			<ModalHeader>Resolve event</ModalHeader>

			<Typography>
				<b>Timestamp:</b> {timeToLabel(selectedTimeOrZero)}
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
						<ListItem {...props} key={option.card.id}>
							<EventHeaderRenderer event={option.card} owningActor={null} short={true} active />
						</ListItem>
					)}
					renderInput={(params) => <TextField {...params} label="Event to resolve" />}
				/>
			)}
			{removableCards.length === 0 && (
				<TextField label="Event to resolve" disabled value="No events available!" />
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
								collapsed={!expandedEvents.includes(previewOption.card.id)}
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
							startIcon={icon}
							color={iconColor}
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
