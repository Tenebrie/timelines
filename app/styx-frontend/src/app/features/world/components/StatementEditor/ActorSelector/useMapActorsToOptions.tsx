import { useCallback } from 'react'

import { Actor } from '../../../types'

export const useMapActorsToOptions = () => {
	const mapActorsToOptions = useCallback(
		(targetActors: Actor[]) =>
			targetActors.map((actor) => ({
				...actor,
				label: `${actor.name}, ${actor.title}`,
			})),
		[]
	)

	return {
		mapActorsToOptions,
	}
}
