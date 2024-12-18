import Grid from '@mui/material/Grid'

import { ActorDetailsEditor } from './components/ActorDetailsEditor/ActorDetailsEditor'
import { ActorEvents } from './components/ActorEvents/ActorEvents'
import { DeleteActorModal } from './components/DeleteActorModal/DeleteActorModal'
import { useActorEditorTarget } from './hooks/useActorEditorTarget'
import { FullHeightContainer } from './styles'

export const ActorEditor = () => {
	const actor = useActorEditorTarget()

	if (!actor) {
		return <></>
	}

	return (
		<FullHeightContainer maxWidth="xl">
			<Grid container spacing={2} padding={2} columns={{ xs: 12, sm: 12, md: 12 }} height="100%">
				<Grid item xs={12} md={6} style={{ maxHeight: '100%' }}>
					<ActorDetailsEditor key={actor.id} actor={actor} />
				</Grid>
				<Grid item xs={12} md={6} style={{ height: '100%' }}>
					<ActorEvents actor={actor} />
				</Grid>
			</Grid>
			<DeleteActorModal />
		</FullHeightContainer>
	)
}
