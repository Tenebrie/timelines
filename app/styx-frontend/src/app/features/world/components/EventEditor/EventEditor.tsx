import { Add } from '@mui/icons-material'
import { Button, Grid } from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'

import { LoadingSpinner } from '../../../../components/LoadingSpinner'
import { OverlayingLabel } from '../../../../components/OverlayingLabel'
import { worldSlice } from '../../reducer'
import { useWorldRouter } from '../../router'
import { getWorldState } from '../../selectors'
import { StatementCard } from '../StatementCards/StatementCard/StatementCard'
import { DeleteEventModal } from './components/DeleteEventModal/DeleteEventModal'
import { EventDetailsEditor } from './components/EventDetailsEditor/EventDetailsEditor'
import { IssuedStatementWizard } from './components/IssuedStatementWizard/IssuedStatementWizard'
import { RevokedStatementWizard } from './components/RevokedStatementWizard/RevokedStatementWizard'
import { EventEditorWrapper, FullHeightContainer, StatementsScroller, StatementsUnit } from './styles'

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
		<FullHeightContainer maxWidth="xl">
			<Grid container spacing={2} padding={2} columns={{ xs: 12, sm: 12, md: 12 }} height="100%">
				<Grid item xs={6} md={3} order={{ xs: 1, md: 0 }} style={{ height: '100%' }}>
					<StatementsUnit>
						<OverlayingLabel>Issued statements</OverlayingLabel>
						<StatementsScroller>
							{addedWorldCards.map((card) => (
								<StatementCard key={card.id} card={card} />
							))}
						</StatementsScroller>
						<Button onClick={() => dispatch(openIssuedStatementWizard())}>
							<Add /> Add
						</Button>
					</StatementsUnit>
				</Grid>
				<Grid item xs={12} md={6} order={{ xs: 0, md: 1 }} style={{ maxHeight: '100%' }}>
					<EventDetailsEditor key={event.id} event={event} />
				</Grid>
				<Grid item xs={6} md={3} order={{ xs: 1, md: 2 }} style={{ height: '100%' }}>
					<StatementsUnit>
						<OverlayingLabel>Revoked statements</OverlayingLabel>
						<StatementsScroller>
							{removedWorldCards.map((card) => (
								<StatementCard key={card.id} card={card} />
							))}
						</StatementsScroller>
						<Button onClick={() => dispatch(openRevokedStatementWizard())}>
							<Add /> Add
						</Button>
					</StatementsUnit>
				</Grid>
			</Grid>
			<DeleteEventModal />
			<IssuedStatementWizard />
			<RevokedStatementWizard />
		</FullHeightContainer>
	)
}
