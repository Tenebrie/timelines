import { Grid } from '@mui/material'
import { useMemo } from 'react'

import { mockEventDeltaModel } from '../../../../../../api/rheaApi.mock'
import { useWorldRouter } from '../../../router'
import { WorldEventDelta } from '../../../types'
import { FullHeightContainer } from '../styles'
import { EventDeltaDetailsEditor } from './components/EventDeltaDetailsEditor'

export const EventDeltaCreator = () => {
	const { selectedTime, eventDeltaCreatorParams } = useWorldRouter()

	// const { setEventCreatorGhostEvent } = worldSlice.actions
	// const dispatch = useDispatch()

	const defaultDeltaValues: WorldEventDelta = useMemo(
		() =>
			mockEventDeltaModel({
				worldEventId: eventDeltaCreatorParams.eventId,
				name: '',
				description: '',
				timestamp: selectedTime,
			}),
		[eventDeltaCreatorParams, selectedTime]
	)

	// useEffect(() => {
	// 	dispatch(setEventCreatorGhostEvent(defaultEventValues))
	// 	return () => {
	// 		dispatch(setEventCreatorGhostEvent(null))
	// 	}
	// }, [defaultEventValues, dispatch, setEventCreatorGhostEvent])

	return (
		<FullHeightContainer maxWidth="xl">
			<Grid container spacing={2} padding={2} columns={{ xs: 12, sm: 12, md: 12 }} height="100%">
				<EventDeltaDetailsEditor delta={defaultDeltaValues} mode="create" />
			</Grid>
		</FullHeightContainer>
	)
}
