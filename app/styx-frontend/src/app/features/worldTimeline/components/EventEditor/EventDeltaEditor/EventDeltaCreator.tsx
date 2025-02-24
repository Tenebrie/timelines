// @ts-nocheck
import Grid from '@mui/material/Grid'
import { useParams } from '@tanstack/react-router'
import { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { mockEventDeltaModel } from '@/api/rheaApi.mock'
import { worldSlice } from '@/app/features/world/reducer'
import { getWorldState } from '@/app/features/world/selectors'
import { WorldEventDelta } from '@/app/features/worldTimeline/types'

import { FullHeightContainer } from '../styles'
import { EventDeltaDetailsEditor } from './components/EventDeltaDetailsEditor'

export const EventDeltaCreator = () => {
	const { selectedTime } = useSelector(getWorldState)
	const { eventId } = useParams({
		from: '/world/$worldId/_world/timeline/_timeline/delta/create/$eventId',
	})

	const { setEventDeltaCreatorGhost } = worldSlice.actions
	const dispatch = useDispatch()

	const defaultDeltaValues: WorldEventDelta = useMemo(
		() =>
			mockEventDeltaModel({
				worldEventId: eventId,
				name: '',
				description: '',
				timestamp: selectedTime,
			}),
		[eventId, selectedTime],
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
