import { Grid } from '@mui/material'
import { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { mockEventDeltaModel } from '../../../../../../api/rheaApi.mock'
import { worldSlice } from '../../../reducer'
import { useWorldRouter } from '../../../router'
import { getWorldState } from '../../../selectors'
import { WorldEventDelta } from '../../../types'
import { FullHeightContainer } from '../styles'
import { EventDeltaDetailsEditor } from './components/EventDeltaDetailsEditor'

export const EventDeltaCreator = () => {
	const { events } = useSelector(getWorldState)
	const { selectedTime, eventDeltaCreatorParams } = useWorldRouter()

	const { setEventDeltaCreatorGhost } = worldSlice.actions
	const dispatch = useDispatch()

	const event = useMemo(
		() => events.find((event) => event.id === eventDeltaCreatorParams.eventId),
		[eventDeltaCreatorParams.eventId, events]
	)

	const defaultDeltaValues: WorldEventDelta = useMemo(
		() =>
			mockEventDeltaModel({
				worldEventId: eventDeltaCreatorParams.eventId,
				name: event?.name ?? '',
				description: event?.description ?? '',
				timestamp: selectedTime,
			}),
		[event, eventDeltaCreatorParams.eventId, selectedTime]
	)

	useEffect(() => {
		dispatch(setEventDeltaCreatorGhost(defaultDeltaValues))
		return () => {
			dispatch(setEventDeltaCreatorGhost(null))
		}
	}, [defaultDeltaValues, dispatch, setEventDeltaCreatorGhost])

	return (
		<FullHeightContainer maxWidth="xl">
			<Grid container spacing={2} padding={2} columns={{ xs: 12, sm: 12, md: 12 }} height="100%">
				<EventDeltaDetailsEditor delta={defaultDeltaValues} mode="create" />
			</Grid>
		</FullHeightContainer>
	)
}
