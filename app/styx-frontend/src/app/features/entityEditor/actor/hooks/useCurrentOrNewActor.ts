import { useMemo } from 'react'
import { useSelector } from 'react-redux'

import { mockActorModel } from '@/api/mock/rheaModels.mock'
import { ActorDetails } from '@/api/types/worldTypes'
import { getWorldState } from '@/app/views/world/WorldSliceSelectors'

type Props = {
	editedActor?: ActorDetails | null
}

export const useCurrentOrNewActor = ({ editedActor }: Props) => {
	const { id: worldId } = useSelector(getWorldState, (a, b) => a.id === b.id)
	const { actor, mode } = useMemo(
		() => ({
			actor:
				editedActor ??
				mockActorModel({
					worldId,
					name: '',
					title: '',
					color: '#32a995',
					content: '',
					contentRich: '',
				}),
			mode: editedActor ? ('edit' as const) : ('create' as const),
		}),
		[editedActor, worldId],
	)
	return {
		id: actor.id,
		worldId,
		actor,
		mode,
	}
}
