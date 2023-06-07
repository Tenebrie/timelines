import { useSelector } from 'react-redux'

import { useWorldRouter } from '../../../router'
import { getWorldState } from '../../../selectors'

export const useActorEditorTarget = () => {
	const { actors } = useSelector(getWorldState)
	const { actorEditorParams } = useWorldRouter()
	const { actorId } = actorEditorParams

	return actors.find((a) => a.id === actorId)
}
