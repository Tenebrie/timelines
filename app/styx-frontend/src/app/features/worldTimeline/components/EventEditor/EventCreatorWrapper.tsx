import Grid from '@mui/material/Grid'

import { EventCreator } from './EventCreator'
import { FullHeightContainer } from './styles'

export const EventCreatorWrapper = () => {
	return (
		<FullHeightContainer maxWidth="xl">
			<Grid container spacing={2} padding={2} columns={{ xs: 12, sm: 12, md: 12 }} height="100%">
				<EventCreator mode={'create'} />
			</Grid>
		</FullHeightContainer>
	)
}
