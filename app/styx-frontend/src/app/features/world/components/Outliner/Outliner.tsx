import { Button, Container, Grid, Stack } from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'

import { OverlayingLabel } from '../../../../components/OverlayingLabel'
import { useWorldTime } from '../../../time/hooks/useWorldTime'
import { worldSlice } from '../../reducer'
import { useWorldRouter } from '../../router'
import { getWorldState } from '../../selectors'
import { OutlinerCard } from './components/OutlinerCard/OutlinerCard'
import { OutlinerContainer, StatementsScroller, StatementsUnit } from './styles'

export const Outliner = () => {
	const { events } = useSelector(getWorldState)
	const { timeToLabel } = useWorldTime()

	const { outlinerParams } = useWorldRouter()
	const selectedTime = Number(outlinerParams.timestamp)

	const dispatch = useDispatch()
	const { openEventWizard } = worldSlice.actions

	const issuedCards = events
		.filter((event) => event.timestamp <= selectedTime)
		.flatMap((event) => event.issuedStatements)

	const revokedCards = events
		.filter((event) => event.timestamp <= selectedTime)
		.flatMap((event) => event.revokedStatements)

	const applicableCards = issuedCards.filter(
		(issuedCard) => !revokedCards.some((revokedCard) => issuedCard.id === revokedCard.id)
	)

	const onCreateEvent = () => {
		dispatch(openEventWizard({ timestamp: selectedTime }))
	}

	return (
		<Container maxWidth="lg" style={{ height: '100%' }}>
			<Grid container padding={2} columns={{ xs: 12, sm: 12, md: 12 }} height="100%" direction="column">
				<Grid item xs={12} md={6} order={{ xs: 0, md: 1 }} height="100%">
					<OutlinerContainer>
						<Stack justifyContent="space-between" alignItems="center" direction="row">
							<div>{timeToLabel(selectedTime)}</div>
							<Button variant="outlined" onClick={onCreateEvent}>
								Create event here
							</Button>
						</Stack>
						<StatementsUnit>
							<OverlayingLabel>World state</OverlayingLabel>
							<StatementsScroller>
								{applicableCards.map((card) => (
									<OutlinerCard key={card.id} card={card} />
								))}
							</StatementsScroller>
						</StatementsUnit>
					</OutlinerContainer>
				</Grid>
			</Grid>
		</Container>
	)
}
