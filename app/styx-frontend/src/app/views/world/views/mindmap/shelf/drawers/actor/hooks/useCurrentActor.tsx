import { useSearch } from '@tanstack/react-router'
import { useMemo } from 'react'
import { useSelector } from 'react-redux'

import { getWorldState } from '@/app/views/world/WorldSliceSelectors'

export const useCurrentActor = () => {
	const selectedActorIds = useSearch({
		from: '/world/$worldId/_world/mindmap',
		select: (search) => search.selection,
	})
	const { actors } = useSelector(getWorldState, (a, b) => a.actors === b.actors)

	const actor = useMemo(() => {
		if (selectedActorIds.length === 0) {
			return undefined
		}
		return actors.find((m) => m.id === selectedActorIds[0])
	}, [actors, selectedActorIds])

	return {
		id: actor?.id,
		worldId: actor?.worldId,
		actor,
	}
}
