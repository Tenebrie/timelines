import { useMemo } from 'react'
import { useSelector } from 'react-redux'

import { getWorldState } from '@/app/views/world/WorldSliceSelectors'

export const useVisibleActors = () => {
	const { actors, search } = useSelector(
		getWorldState,
		(a, b) => a.actors === b.actors && a.search === b.search,
	)

	const visibleActors = useMemo(() => {
		if (search.query) {
			return search.results.actors
		}

		return actors
	}, [actors, search])

	return visibleActors
}
