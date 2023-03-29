import { Button, Typography } from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'

import { useWorldTime } from '../../../time/hooks/useWorldTime'
import { worldSlice } from '../../reducer'
import { useWorldRouter } from '../../router'
import { getWorldOutlinerState, getWorldState } from '../../selectors'
import { IssuedStatementCard } from '../StatementCards/IssuedStatementCard/IssuedStatementCard'
import { OutlinerContainer, StatementsContainer, StatementsUnit } from './styles'

export const Outliner = () => {
	const { events } = useSelector(getWorldState)
	const { selectedTime } = useSelector(getWorldOutlinerState)
	const { timeToLabel } = useWorldTime()

	const dispatch = useDispatch()
	const { openEventWizard } = worldSlice.actions

	const { navigateToDefaultRoute } = useWorldRouter()

	if (selectedTime === null) {
		navigateToDefaultRoute()
		return <></>
	}

	const issuedCards = events
		.filter((event) => event.timestamp <= selectedTime)
		.flatMap((event) => event.issuedWorldStatements)

	const revokedCards = events
		.filter((event) => event.timestamp <= selectedTime)
		.flatMap((event) => event.revokedWorldStatements)

	const applicableCards = issuedCards.filter((card) => !revokedCards.some((id) => card.id === id))

	const onCreateEvent = () => {
		dispatch(openEventWizard({ timestamp: selectedTime }))
	}

	return (
		<OutlinerContainer>
			<div>{timeToLabel(selectedTime)}</div>
			<div>
				<Typography variant="h5">World state:</Typography>
				<StatementsContainer>
					<StatementsUnit>
						{applicableCards.map((card) => (
							<IssuedStatementCard key={card.id} card={card} mode="outliner" />
						))}
					</StatementsUnit>
				</StatementsContainer>
			</div>
			<Button variant="outlined" onClick={onCreateEvent}>
				Create event here
			</Button>
		</OutlinerContainer>
	)
}
