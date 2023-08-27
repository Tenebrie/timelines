import { Grid } from '@mui/material'
import { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { mockEventModel } from '../../../../../api/rheaApi.mock'
import { worldSlice } from '../../reducer'
import { useWorldRouter } from '../../router'
import { getWorldState } from '../../selectors'
import { WorldEvent } from '../../types'
import { EventDetailsEditor } from './components/EventDetailsEditor/EventDetailsEditor'
import { FullHeightContainer } from './styles'

export const EventCreator = () => {
	const { id, events } = useSelector(getWorldState)
	const { selectedTime } = useWorldRouter()

	const { setEventCreatorGhostEvent } = worldSlice.actions
	const dispatch = useDispatch()

	const { query } = useWorldRouter()
	const { eventCreatorReplacedEventId } = query

	const replacedEvent = events.find((event) => event.id === eventCreatorReplacedEventId)

	const defaultEventValues: WorldEvent = useMemo(
		() =>
			mockEventModel({
				worldId: id,
				name: '',
				description: '',
				timestamp: selectedTime,
				extraFields: replacedEvent ? ['ReplacesEvent'] : [],
				replaces: replacedEvent
					? {
							id: replacedEvent.id,
							name: replacedEvent.name,
							timestamp: replacedEvent.timestamp,
					  }
					: null,
			}),
		[id, replacedEvent, selectedTime]
	)

	useEffect(() => {
		dispatch(setEventCreatorGhostEvent(defaultEventValues))
		return () => {
			dispatch(setEventCreatorGhostEvent(null))
		}
	}, [defaultEventValues, dispatch, setEventCreatorGhostEvent])

	return (
		<FullHeightContainer maxWidth="xl">
			<Grid container spacing={2} padding={2} columns={{ xs: 12, sm: 12, md: 12 }} height="100%">
				<EventDetailsEditor event={defaultEventValues} mode="create" />
			</Grid>
		</FullHeightContainer>
	)
}
