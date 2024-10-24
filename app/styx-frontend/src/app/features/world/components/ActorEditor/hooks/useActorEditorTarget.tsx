import { useSelector } from 'react-redux'

import { useWorldRouter, worldRoutes } from '../../../../../../router/routes/worldRoutes'
import { getWorldState } from '../../../selectors'

export const useActorEditorTarget = () => {
	const { actors } = useSelector(getWorldState)
	const { stateOf } = useWorldRouter()
	const { actorId } = stateOf(worldRoutes.actorEditor)

	return actors.find((a) => a.id === actorId)
}
