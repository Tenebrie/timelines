import { Grid } from '@mui/material'
import { useSelector } from 'react-redux'

import { mockEventModel } from '../../../../../api/rheaApi.mock'
import { useWorldRouter } from '../../router'
import { getWorldState } from '../../selectors'
import { WorldEvent } from '../../types'
import { EventDetailsEditor } from './components/EventDetailsEditor/EventDetailsEditor'
import { RevokedStatementWizard } from './components/RevokedStatementWizard/RevokedStatementWizard'
import { FullHeightContainer } from './styles'

export const EventCreator = () => {
	const { id } = useSelector(getWorldState)
	const { selectedTime } = useWorldRouter()

	const defaultEventValues: WorldEvent = mockEventModel({
		worldId: id,
		name: '',
		description: '',
		timestamp: selectedTime,
	})

	return (
		<FullHeightContainer maxWidth="xl">
			<Grid container spacing={2} padding={2} columns={{ xs: 12, sm: 12, md: 12 }} height="100%">
				<EventDetailsEditor event={defaultEventValues} mode="create" />
			</Grid>
			<RevokedStatementWizard />
		</FullHeightContainer>
	)
}
