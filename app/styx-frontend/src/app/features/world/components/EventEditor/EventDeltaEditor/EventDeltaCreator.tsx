import { Grid } from '@mui/material'
import { useEffect, useMemo } from 'react'
import { useDispatch } from 'react-redux'

import { mockEventDeltaModel } from '@/api/rheaApi.mock'
import { worldSlice } from '@/app/features/world/reducer'
import { WorldEventDelta } from '@/app/features/world/types'
import { useWorldRouter, worldRoutes } from '@/router/routes/worldRoutes'

import { FullHeightContainer } from '../styles'
import { EventDeltaDetailsEditor } from './components/EventDeltaDetailsEditor'

export const EventDeltaCreator = () => {
	const { selectedTimeOrZero, stateOf } = useWorldRouter()
	const { eventId } = stateOf(worldRoutes.eventDeltaCreator)

	const { setEventDeltaCreatorGhost } = worldSlice.actions
	const dispatch = useDispatch()

	const defaultDeltaValues: WorldEventDelta = useMemo(
		() =>
			mockEventDeltaModel({
				worldEventId: eventId,
				name: '',
				description: '',
				timestamp: selectedTimeOrZero,
			}),
		[eventId, selectedTimeOrZero],
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
