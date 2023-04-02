import { Add } from '@mui/icons-material'
import { Button, Typography } from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'

import { LoadingSpinner } from '../../../../components/LoadingSpinner'
import { worldSlice } from '../../reducer'
import { useWorldRouter } from '../../router'
import { getWorldState } from '../../selectors'
import { IssuedStatementCard } from '../StatementCards/IssuedStatementCard/IssuedStatementCard'
import { RevokedStatementCard } from '../StatementCards/RevokedStatementCard/RevokedStatementCard'
import { DeleteEventModal } from './components/DeleteEventModal/DeleteEventModal'
import { DeleteStatementModal } from './components/DeleteStatementModal/DeleteStatementModal'
import { EventDetailsEditor } from './components/EventDetailsEditor/EventDetailsEditor'
import { IssuedStatementWizard } from './components/IssuedStatementWizard/IssuedStatementWizard'
import { RevokedStatementWizard } from './components/RevokedStatementWizard/RevokedStatementWizard'
import { EventEditorContainer, EventEditorWrapper, StatementsContainer, StatementsUnit } from './styles'

export const EventEditor = () => {
	const { events } = useSelector(getWorldState)

	const dispatch = useDispatch()
	const { openIssuedStatementWizard, openRevokedStatementWizard } = worldSlice.actions

	const { eventEditorParams } = useWorldRouter()
	const { eventId } = eventEditorParams

	const event = events.find((e) => e.id === eventId)

	if (!event) {
		return (
			<EventEditorWrapper>
				<LoadingSpinner />
			</EventEditorWrapper>
		)
	}

	const { issuedStatements: addedWorldCards, revokedStatements: removedWorldCards } = event

	return (
		<EventEditorWrapper>
			<EventEditorContainer>
				<EventDetailsEditor key={event.id} event={event} />
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
				<DeleteEventModal />
				<DeleteStatementModal />
				<IssuedStatementWizard />
				<RevokedStatementWizard />
			</EventEditorContainer>
		</EventEditorWrapper>
	)
}
