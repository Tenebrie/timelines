import { Add, Delete, Save } from '@mui/icons-material'
import { Button, TextField, Typography } from '@mui/material'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { worldSlice } from '../../reducer'
import { useWorldRouter } from '../../router'
import { getWorldState } from '../../selectors'
import { WorldEvent, WorldStatement } from '../../types'
import { IssuedStatementCard } from '../StatementCards/IssuedStatementCard/IssuedStatementCard'
import { RevokedStatementCard } from '../StatementCards/RevokedStatementCard/RevokedStatementCard'
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
	const [issuedStatementWizardOpen, setIssuedStatementWizardOpen] = useState(false)
	const [revokedStatementWizardOpen, setRevokedStatementWizardOpen] = useState(false)

	const { events } = useSelector(getWorldState)

	const dispatch = useDispatch()
	const { updateWorldEvent, deleteWorldEvent } = worldSlice.actions

	const { navigateToCurrentWorld, eventEditorParams } = useWorldRouter()
	const { eventId } = eventEditorParams

	const event = events.find((e) => e.id === eventId)

	if (!event) {
		return <EventEditorWrapper></EventEditorWrapper>
	}

	const updateEditorEvent = (delta: Partial<WorldEvent>) => {
		dispatch(
			updateWorldEvent({
				...event,
				...delta,
			})
		)
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
	const onIssueWorldStatement = (statement: WorldStatement) =>
		updateEditorEvent({
			issuedStatements: addedWorldCards.concat(statement),
		})
	const onRemoveIssuedWorldStatement = (id: string) =>
		updateEditorEvent({
			issuedStatements: addedWorldCards.filter((card) => card.id !== id),
		})
	const onRevokeWorldStatement = (statement: WorldStatement) =>
		updateEditorEvent({
			revokedStatements: removedWorldCards.concat(statement),
		})
	const onRemoveRevokedWorldStatement = (id: string) =>
		updateEditorEvent({
			revokedStatements: removedWorldCards.filter((card) => card.id !== id),
		})

	const onSave = () => {
		navigateToCurrentWorld()
	}

	const onDelete = () => {
		dispatch(deleteWorldEvent(event.id))
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
							<IssuedStatementCard
								key={card.id}
								mode="editor"
								card={card}
								onDelete={() => onRemoveIssuedWorldStatement(card.id)}
							/>
						))}
						<Button onClick={() => setIssuedStatementWizardOpen(true)}>
							<Add /> Add
						</Button>
					</StatementsUnit>
					<StatementsUnit>
						<Typography variant="h5">Revoked statements:</Typography>
						{removedWorldCards.map((card) => (
							<RevokedStatementCard
								key={card.id}
								id={card.id}
								onDelete={() => onRemoveRevokedWorldStatement(card.id)}
							/>
						))}
						<Button onClick={() => setRevokedStatementWizardOpen(true)}>
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
				<IssuedStatementWizard
					open={issuedStatementWizardOpen}
					onCreate={onIssueWorldStatement}
					onClose={() => setIssuedStatementWizardOpen(false)}
				/>
				<RevokedStatementWizard
					editorEvent={event}
					open={revokedStatementWizardOpen}
					onRevoke={onRevokeWorldStatement}
					onClose={() => setRevokedStatementWizardOpen(false)}
				/>
			</EventEditorContainer>
		</EventEditorWrapper>
	)
}
