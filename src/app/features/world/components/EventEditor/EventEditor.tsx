import { Add } from '@mui/icons-material'
import { Button, IconButton, TextField } from '@mui/material'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { worldSlice } from '../../reducer'
import { useWorldRouter } from '../../router'
import { getEventEditorState } from '../../selectors'
import { StoryEvent, WorldStatement } from '../../types'
import { IssuedStatementCard } from './components/IssuedStatementCard/IssuedStatementCard'
import { IssuedStatementWizard } from './components/IssuedStatementWizard/IssuedStatementWizard'
import { RevokedStatementCard } from './components/RevokedStatementCard/RevokedStatementCard'
import { RevokedStatementWizard } from './components/RevokedStatementWizard/RevokedStatementWizard'
import { EventEditorContainer } from './styles'

export const EventEditor = () => {
	const [issuedStatementWizardOpen, setIssuedStatementWizardOpen] = useState(false)
	const [revokedStatementWizardOpen, setRevokedStatementWizardOpen] = useState(false)

	const { event } = useSelector(getEventEditorState)

	const dispatch = useDispatch()
	const { setEditorEvent, flushEditorEvent } = worldSlice.actions

	const { navigateToRoot } = useWorldRouter()

	if (!event) {
		navigateToRoot()
		return <></>
	}

	const updateEvent = (delta: Partial<StoryEvent>) => {
		dispatch(
			setEditorEvent({
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

	const onNameChange = (value: string) => updateEvent({ name: value })
	const onTimestampChange = (value: number) => updateEvent({ timestamp: value })
	const onDescriptionChange = (value: string) => updateEvent({ description: value })
	const onIssueWorldStatement = (statement: WorldStatement) =>
		updateEvent({
			issuedWorldStatements: addedWorldCards.concat(statement),
		})
	const onRemoveIssuedWorldStatement = (id: string) =>
		updateEvent({
			issuedWorldStatements: addedWorldCards.filter((card) => card.id !== id),
		})
	const onRevokeWorldStatement = (id: string) =>
		updateEvent({
			revokedWorldStatements: removedWorldCardIds.concat(id),
		})
	const onRemoveRevokedWorldStatement = (id: string) =>
		updateEvent({
			revokedWorldStatements: removedWorldCardIds.filter((card) => card !== id),
		})

	const onSave = () => {
		dispatch(flushEditorEvent())
		navigateToRoot()
	}

	return (
		<EventEditorContainer>
			<TextField label="Name" value={name} onChange={(e) => onNameChange(e.target.value)} variant="filled" />
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
			<div>
				<div>Add card actions:</div>
				{addedWorldCards.map((card) => (
					<IssuedStatementCard
						key={card.id}
						card={card}
						onDelete={() => onRemoveIssuedWorldStatement(card.id)}
					/>
				))}
				<IconButton onClick={() => setIssuedStatementWizardOpen(true)}>
					<Add />
				</IconButton>
			</div>
			<div>
				<div>Remove card actions:</div>
				{removedWorldCardIds.map((card) => (
					<RevokedStatementCard key={card} id={card} onDelete={() => onRemoveRevokedWorldStatement(card)} />
				))}
				<IconButton onClick={() => setRevokedStatementWizardOpen(true)}>
					<Add />
				</IconButton>
			</div>
			<Button onClick={onSave} variant="outlined">
				Save
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
	)
}
