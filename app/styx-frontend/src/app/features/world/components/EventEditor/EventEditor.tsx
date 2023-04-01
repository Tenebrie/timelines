import { Add, Delete, Save } from '@mui/icons-material'
import { Button, TextField, Typography } from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'

import { useDeleteWorldEventMutation } from '../../../../../api/rheaApi'
import { worldSlice } from '../../reducer'
import { useWorldRouter } from '../../router'
import { getWorldState } from '../../selectors'
import { WorldEvent } from '../../types'
import { IssuedStatementCard } from '../StatementCards/IssuedStatementCard/IssuedStatementCard'
import { RevokedStatementCard } from '../StatementCards/RevokedStatementCard/RevokedStatementCard'
import { DeleteStatementModal } from './components/DeleteStatementModal/DeleteStatementModal'
import { IssuedStatementWizard } from './components/IssuedStatementWizard/IssuedStatementWizard'
import { RevokedStatementWizard } from './components/RevokedStatementWizard/RevokedStatementWizard'
import {
	BasicInputs,
	EventEditorContainer,
	EventEditorWrapper,
	StatementsContainer,
	StatementsUnit,
} from './styles'

export const EventEditor = () => {
	const { events } = useSelector(getWorldState)

	const dispatch = useDispatch()
	const { openIssuedStatementWizard, openRevokedStatementWizard } = worldSlice.actions

	const [deleteWorldEvent, { isLoading }] = useDeleteWorldEventMutation()

	const { navigateToCurrentWorld, eventEditorParams } = useWorldRouter()
	const { eventId } = eventEditorParams

	const event = events.find((e) => e.id === eventId)

	if (!event) {
		return <EventEditorWrapper></EventEditorWrapper>
	}

	const updateEditorEvent = (delta: Partial<WorldEvent>) => {
		// TODO
	}

	const {
		name,
		timestamp,
		description,
		issuedStatements: addedWorldCards,
		revokedStatements: removedWorldCards,
	} = event

	const onNameChange = (value: string) => updateEditorEvent({ name: value })
	const onTimestampChange = (value: number) => updateEditorEvent({ timestamp: value })
	const onDescriptionChange = (value: string) => updateEditorEvent({ description: value })

	const onSave = () => {
		navigateToCurrentWorld()
	}

	const onDelete = () => {
		deleteWorldEvent({
			worldId: eventEditorParams.worldId,
			eventId: eventEditorParams.eventId,
		})
		navigateToCurrentWorld()
	}

	return (
		<EventEditorWrapper>
			<EventEditorContainer>
				<BasicInputs>
					<TextField
						label="Name"
						value={name}
						onChange={(e) => onNameChange(e.target.value)}
						variant="filled"
					/>
					<TextField
						label="Timestamp"
						value={timestamp}
						onChange={(e) => onTimestampChange(Number(e.target.value))}
						variant="filled"
						type={'number'}
					/>
					<TextField
						label="Description"
						value={description}
						onChange={(e) => onDescriptionChange(e.target.value)}
						variant="filled"
						rows={10}
					/>
				</BasicInputs>
				<StatementsContainer>
					<StatementsUnit>
						<Typography variant="h5">Issued statements:</Typography>
						{addedWorldCards.map((card) => (
							<IssuedStatementCard key={card.id} mode="editor" card={card} />
						))}
						<Button onClick={() => dispatch(openIssuedStatementWizard())}>
							<Add /> Add
						</Button>
					</StatementsUnit>
					<StatementsUnit>
						<Typography variant="h5">Revoked statements:</Typography>
						{removedWorldCards.map((card) => (
							<RevokedStatementCard key={card.id} id={card.id} />
						))}
						<Button onClick={() => dispatch(openRevokedStatementWizard())}>
							<Add /> Add
						</Button>
					</StatementsUnit>
				</StatementsContainer>
				<Button onClick={onSave} variant="outlined">
					<Save /> Save
				</Button>
				<Button variant="outlined" onClick={onDelete}>
					<Delete /> Delete
				</Button>
				<IssuedStatementWizard />
				<RevokedStatementWizard />
				<DeleteStatementModal />
			</EventEditorContainer>
		</EventEditorWrapper>
	)
}
