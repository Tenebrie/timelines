import { ResizeableDrawer } from '@/app/components/ResizeGrabber/ResizeableDrawer'

import { useCurrentOrNewActor } from '../worldTimeline/hooks/useCurrentOrNewActor'
import { ActorDrawerListener } from './ActorDrawerListener'
import { ActorDrawerOutlet } from './ActorDrawerOutlet'

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
