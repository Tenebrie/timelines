import { ResizeableDrawer } from '@/app/components/ResizeGrabber/ResizeableDrawer'

import { ActorDrawerListener } from './components/ActorDrawerListener'
import { ActorDrawerOutlet } from './components/ActorDrawerOutlet'
import { useCurrentOrNewActor } from './hooks/useCurrentOrNewActor'

export function ActorDrawer() {
	const { actor } = useCurrentOrNewActor()

	return (
		<ResizeableDrawer
			pulldownWidth={140}
			pulldownLabel={actor ? 'Edit actor' : 'Create actor'}
			minHeight={235}
			persistentStateKey="actorDrawerState/v1"
			keepMounted
		>
			<ActorDrawerOutlet />
			<ActorDrawerListener />
		</ResizeableDrawer>
	)
}
