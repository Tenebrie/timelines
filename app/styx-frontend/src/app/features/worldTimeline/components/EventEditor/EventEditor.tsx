import Grid from '@mui/material/Grid'
import { useSelector } from 'react-redux'

import {
	useWorldTimelineRouter,
	worldTimelineRoutes,
} from '@/router/routes/featureRoutes/worldTimelineRoutes'

import { getWorldState } from '../../selectors'
import { EventDetailsEditor } from './components/EventDetailsEditor/EventDetailsEditor'
import { FullHeightContainer } from './styles'

export const EventEditor = () => {
	const { events } = useSelector(getWorldState, (a, b) => a.events === b.events)
	const { stateOf } = useWorldTimelineRouter()
	const { eventId } = stateOf(worldTimelineRoutes.eventEditor)

	const event = events.find((e) => e.id === eventId)

	if (!event) {
		return <></>
	}

	return (
		<FullHeightContainer maxWidth="xl">
			<Grid container spacing={2} padding={2} columns={{ xs: 12, sm: 12, md: 12 }} height="100%">
				<EventDetailsEditor event={event} mode="edit" />
			</Grid>
		</FullHeightContainer>
	)
}
