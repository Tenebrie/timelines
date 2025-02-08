import Grid from '@mui/material/Grid'
import { useParams } from '@tanstack/react-router'
import { useSelector } from 'react-redux'

import { getWorldState } from '@/app/features/world/selectors'

import { FullHeightContainer } from '../styles'
import { EventDeltaDetailsEditor } from './components/EventDeltaDetailsEditor'

export const EventDeltaEditor = () => {
	const { events } = useSelector(getWorldState)
	const { eventId, deltaId } = useParams({
		from: '/world/$worldId/_world/timeline/_timeline/event/$eventId/delta/$deltaId',
	})

	const event = events.find((e) => e.id === eventId)

	if (!event) {
		return <></>
	}

	const delta = event.deltaStates.find((d) => d.id === deltaId)
	if (!delta) {
		return <></>
	}

	return (
		<FullHeightContainer maxWidth="xl">
			<Grid container spacing={2} padding={2} columns={{ xs: 12, sm: 12, md: 12 }} height="100%">
				<EventDeltaDetailsEditor delta={delta} mode="edit" />
			</Grid>
		</FullHeightContainer>
	)
}
