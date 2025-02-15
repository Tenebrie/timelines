import Grid from '@mui/material/Grid'
import { useParams } from '@tanstack/react-router'
import { useSelector } from 'react-redux'

import { getWorldState } from '@/app/features/world/selectors'

import { EventDetailsEditor } from './components/EventDetailsEditor/EventDetailsEditor'
import { FullHeightContainer } from './styles'

export const EventEditor = () => {
	const { events } = useSelector(getWorldState, (a, b) => a.events === b.events)
	const { eventId } = useParams({
		from: '/world/$worldId/_world/timeline/_timeline/event/$eventId',
	})

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
