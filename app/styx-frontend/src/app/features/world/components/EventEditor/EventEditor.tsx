import { Grid } from '@mui/material'
import { useSelector } from 'react-redux'

import { OverlayingLabel } from '../../../../components/OverlayingLabel'
import { useWorldRouter } from '../../router'
import { getWorldState } from '../../selectors'
import { DeleteEventModal } from './components/DeleteEventModal/DeleteEventModal'
import { EventDetailsEditor } from './components/EventDetailsEditor/EventDetailsEditor'
import { RevokedStatementWizard } from './components/RevokedStatementWizard/RevokedStatementWizard'
import { FullHeightContainer, StatementsUnit } from './styles'

export const EventEditor = () => {
	const { events } = useSelector(getWorldState)
	const { eventEditorParams } = useWorldRouter()
	const { eventId } = eventEditorParams

	const event = events.find((e) => e.id === eventId)

	if (!event) {
		return <></>
	}

	return (
		<FullHeightContainer maxWidth="xl">
			<Grid container spacing={2} padding={2} columns={{ xs: 12, sm: 12, md: 12 }} height="100%">
				<Grid item xs={12} md={6} style={{ maxHeight: '100%' }}>
					<EventDetailsEditor key={event.id} event={event} />
				</Grid>
				<Grid item xs={12} md={6} style={{ height: '100%' }}>
					<StatementsUnit>
						<OverlayingLabel>Statements</OverlayingLabel>
						<>The statements have now been revoked permanently :'(</>
					</StatementsUnit>
				</Grid>
			</Grid>
			<DeleteEventModal />
			<RevokedStatementWizard />
		</FullHeightContainer>
	)
}
