import { useSelector } from 'react-redux'

import { getWorldState } from '@/app/features/worldTimeline/selectors'
import {
	useWorldTimelineRouter,
	worldTimelineRoutes,
} from '@/router/routes/featureRoutes/worldTimelineRoutes'

export const useActorEditorTarget = () => {
	const { actors } = useSelector(getWorldState)
	const { stateOf } = useWorldTimelineRouter()
	const { actorId } = stateOf(worldTimelineRoutes.actorEditor)

	return actors.find((a) => a.id === actorId)
}
