import { Grid } from '@mui/material'
import { useSelector } from 'react-redux'

import { useWorldRouter } from '../../router'
import { getWorldState } from '../../selectors'
import { DeleteEventModal } from './components/DeleteEventModal/DeleteEventModal'
import { EventDetailsEditor } from './components/EventDetailsEditor/EventDetailsEditor'
import { RevokedStatementWizard } from './components/RevokedStatementWizard/RevokedStatementWizard'
import { FullHeightContainer } from './styles'

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
				<EventDetailsEditor key={event.id} event={event} />
			</Grid>
			<DeleteEventModal />
			<RevokedStatementWizard />
		</FullHeightContainer>
	)
}
