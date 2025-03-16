import { useSearch } from '@tanstack/react-router'

import { ActorBulkActions } from './bulk/ActorBulkActions'
import { ActorDetails } from './details/ActorDetails'

export function ActorRouter() {
	const selectedActorIds = useSearch({
		from: '/world/$worldId/_world/mindmap',
		select: (search) => search.selection,
	})

	return (
		<>
			{selectedActorIds.length < 2 && <ActorDetails />}
			{selectedActorIds.length >= 2 && <ActorBulkActions />}
		</>
	)
}
