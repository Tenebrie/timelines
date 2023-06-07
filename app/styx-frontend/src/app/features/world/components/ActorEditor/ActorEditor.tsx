import { Grid } from '@mui/material'

import { ActorDetailsEditor } from './components/ActorDetailsEditor/ActorDetailsEditor'
import { DeleteActorModal } from './components/DeleteActorModal/DeleteActorModal'
import { useActorEditorTarget } from './hooks/useActorEditorTarget'
import { FullHeightContainer } from './styles'

export const ActorEditor = () => {
	const actor = useActorEditorTarget()

	if (!actor) {
		return <></>
	}

	return (
		<FullHeightContainer maxWidth="xl">
			<Grid container spacing={2} padding={2} columns={{ xs: 12, sm: 12, md: 12 }} height="100%">
				{/* <Grid item xs={6} md={3} order={{ xs: 1, md: 0 }} style={{ height: '100%' }}>
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
				</Grid> */}
				<Grid item xs={12} md={6} order={{ xs: 0, md: 1 }} style={{ maxHeight: '100%' }}>
					<ActorDetailsEditor key={actor.id} actor={actor} />
				</Grid>
				{/* <Grid item xs={6} md={3} order={{ xs: 1, md: 2 }} style={{ height: '100%' }}>
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
				</Grid> */}
			</Grid>
			<DeleteActorModal />
		</FullHeightContainer>
	)
}
