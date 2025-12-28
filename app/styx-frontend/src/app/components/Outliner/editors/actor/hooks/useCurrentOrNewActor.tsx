import { mockActorModel } from '@api/mock/rheaModels.mock'
import { useMemo } from 'react'
import { useSelector } from 'react-redux'

import { getRandomEntityColor } from '@/app/utils/colors/getRandomEntityColor'
import { getWorldState } from '@/app/views/world/WorldSliceSelectors'

import { useCurrentActor } from './useCurrentActor'

export const useCurrentOrNewActor = () => {
	const { id: worldId } = useSelector(getWorldState, (a, b) => a.id === b.id)
	const { actor: currentActor } = useCurrentActor()
	const { actor, mode } = useMemo(
		() => ({
			actor:
				currentActor ??
				mockActorModel({
					worldId,
					name: '',
					title: '',
					color: getRandomEntityColor(),
					description: '',
					descriptionRich: '',
				}),
			mode: currentActor ? ('edit' as const) : ('create' as const),
		}),
		[currentActor, worldId],
	)
	return {
		id: actor.id,
		worldId,
		actor,
		mode,
	}
}
