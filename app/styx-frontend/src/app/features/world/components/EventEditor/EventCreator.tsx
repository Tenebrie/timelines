import { Grid } from '@mui/material'
import { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { mockEventModel } from '@/api/rheaApi.mock'
import { useWorldRouter } from '@/router/routes/worldRoutes'

import { worldSlice } from '../../reducer'
import { getWorldState } from '../../selectors'
import { WorldEvent } from '../../types'
import { EventDetailsEditor } from './components/EventDetailsEditor/EventDetailsEditor'
import { FullHeightContainer } from './styles'

export const EventCreator = () => {
	const { id } = useSelector(getWorldState)
	const { selectedTimeOrZero } = useWorldRouter()

	const { setEventCreatorGhost } = worldSlice.actions
	const dispatch = useDispatch()

	const defaultEventValues: WorldEvent = useMemo(
		() =>
			mockEventModel({
				worldId: id,
				name: '',
				description: '',
				timestamp: selectedTimeOrZero,
			}),
		[id, selectedTimeOrZero],
	)

	useEffect(() => {
		dispatch(setEventCreatorGhost(defaultEventValues))
		return () => {
			dispatch(setEventCreatorGhost(null))
		}
	}, [defaultEventValues, dispatch, setEventCreatorGhost])

	return (
		<FullHeightContainer maxWidth="xl">
			<Grid container spacing={2} padding={2} columns={{ xs: 12, sm: 12, md: 12 }} height="100%">
				<EventDetailsEditor event={defaultEventValues} mode="create" />
			</Grid>
		</FullHeightContainer>
	)
}
