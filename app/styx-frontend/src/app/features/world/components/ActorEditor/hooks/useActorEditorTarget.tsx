import { useSelector } from 'react-redux'

import { getWorldState } from '@/app/features/world/selectors'
import { useWorldRouter, worldRoutes } from '@/router/routes/worldRoutes'

export const useActorEditorTarget = () => {
	const { actors } = useSelector(getWorldState)
	const { stateOf } = useWorldRouter()
	const { actorId } = stateOf(worldRoutes.actorEditor)

	return actors.find((a) => a.id === actorId)
}
