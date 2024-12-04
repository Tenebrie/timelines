import { useCallback } from 'react'

import { Actor } from '../../types'

export type ActorOption = ReturnType<ReturnType<typeof useMapActorsToOptions>['mapActorsToOptions']>[number]

export const useMapActorsToOptions = () => {
	const mapActorsToOptions = useCallback((targetActors: Actor[]) => targetActors.map((actor) => actor.id), [])

	return {
		mapActorsToOptions,
	}
}
