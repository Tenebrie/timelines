import { useSelector } from 'react-redux'

import { getWorldState } from '@/app/views/world/WorldSliceSelectors'

export const useActorEditorTarget = () => {
	const { actors } = useSelector(getWorldState)
	// const { actorId } = useParams({ from: '/world/$worldId/_world/timeline/_timeline/actor/$actorId' })
	const actorId = ''

	return actors.find((a) => a.id === actorId)
}
