import { Add, Delete, Save } from '@mui/icons-material'
import { Button, TextField, Typography } from '@mui/material'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { worldSlice } from '../../reducer'
import { useWorldRouter } from '../../router'
import { getEventEditorState } from '../../selectors'
import { StoryEvent, WorldStatement } from '../../types'
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

	const { event } = useSelector(getEventEditorState)

	const dispatch = useDispatch()
	const { updateWorldEvent, deleteWorldEvent } = worldSlice.actions

	const { navigateToCurrentWorldRoot } = useWorldRouter()

	if (!event) {
		return <></>
	}

	const updateEditorEvent = (delta: Partial<StoryEvent>) => {
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
		issuedWorldStatements: addedWorldCards,
		revokedWorldStatements: removedWorldCardIds,
	} = event

	const onNameChange = (value: string) => updateEditorEvent({ name: value })
	const onTimestampChange = (value: number) => updateEditorEvent({ timestamp: value })
	const onDescriptionChange = (value: string) => updateEditorEvent({ description: value })
	const onIssueWorldStatement = (statement: WorldStatement) =>
		updateEditorEvent({
			issuedWorldStatements: addedWorldCards.concat(statement),
		})
	const onRemoveIssuedWorldStatement = (id: string) =>
		updateEditorEvent({
			issuedWorldStatements: addedWorldCards.filter((card) => card.id !== id),
		})
	const onRevokeWorldStatement = (id: string) =>
		updateEditorEvent({
			revokedWorldStatements: removedWorldCardIds.concat(id),
		})
	const onRemoveRevokedWorldStatement = (id: string) =>
		updateEditorEvent({
			revokedWorldStatements: removedWorldCardIds.filter((card) => card !== id),
		})

	const onSave = () => {
		navigateToCurrentWorldRoot()
	}

	const onDelete = () => {
		dispatch(deleteWorldEvent(event.id))
		navigateToCurrentWorldRoot()
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
						{removedWorldCardIds.map((card) => (
							<RevokedStatementCard
								key={card}
								id={card}
								onDelete={() => onRemoveRevokedWorldStatement(card)}
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
					onCreate={onRevokeWorldStatement}
					onClose={() => setRevokedStatementWizardOpen(false)}
				/>
			</EventEditorContainer>
		</EventEditorWrapper>
	)
}
