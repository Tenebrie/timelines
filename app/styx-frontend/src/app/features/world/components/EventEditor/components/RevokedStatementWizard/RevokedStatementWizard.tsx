import { Add } from '@mui/icons-material'
import { LoadingButton } from '@mui/lab'
import { Autocomplete, Button, Collapse, List, ListItem, TextField, Tooltip, Typography } from '@mui/material'
import { useCallback, useState } from 'react'
import { useSelector } from 'react-redux'
import { TransitionGroup } from 'react-transition-group'

import { useRevokeWorldEventMutation } from '@/api/worldEventApi'
import { useModal } from '@/app/features/modals/reducer'
import { getOutlinerPreferences } from '@/app/features/preferences/selectors'
import { useWorldTime } from '@/app/features/time/hooks/useWorldTime'
import { EventHeaderRenderer } from '@/app/features/world/components/Renderers/Event/EventHeaderRenderer'
import { EventWithContentRenderer } from '@/app/features/world/components/Renderers/Event/EventWithContentRenderer'
import { getWorldState } from '@/app/features/world/selectors'
import { useAutosave } from '@/app/utils/autosave/useAutosave'
import { parseApiResponse } from '@/app/utils/parseApiResponse'
import { Shortcut, useShortcut } from '@/hooks/useShortcut'
import { ModalFooter, ModalHeader, useModalCleanup } from '@/ui-lib/components/Modal'
import Modal from '@/ui-lib/components/Modal/Modal'

export const RevokedStatementWizard = () => {
	const { isOpen, preselectedEventId, close } = useModal('revokedStatementWizard')

	const [id, setId] = useState('')
	const [inputValue, setInputValue] = useState('')

	const { id: worldId, selectedTime, events: worldEvents } = useSelector(getWorldState)
	const { expandedEvents } = useSelector(getOutlinerPreferences)

	const [revokeWorldStatement, { isLoading, isError, reset }] = useRevokeWorldEventMutation()
	const { timeToLabel } = useWorldTime()

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
				body: { revokedAt: String(selectedTime) },
			}),
		)
		if (error) {
			return
		}
		close()
	}, [close, id, isOpen, revokeWorldStatement, selectedTime, worldId])

	const onCloseAttempt = () => {
		if (isLoading) {
			return
		}
		close()
	}

	const { largeLabel: shortcutLabel } = useShortcut(
		Shortcut.CtrlEnter,
		() => {
			sendRequest()
		},
		isOpen ? 1 : -1,
	)

	const removableCards = worldEvents
		.filter((event) => event.timestamp < selectedTime)
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
