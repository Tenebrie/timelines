import { useCallback } from 'react'

import { Actor } from '../../types'

export type ActorOption = ReturnType<ReturnType<typeof useMapActorsToOptions>['mapActorsToOptions']>[number]

export const useMapActorsToOptions = () => {
	const mapActorsToOptions = useCallback((actors: Actor[]) => actors.map((actor) => actor.id), [])

	return {
		mapActorsToOptions,
	}
}
