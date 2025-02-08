import { createFileRoute } from '@tanstack/react-router'

import { WorldActors } from '@/app/features/worldActors/WorldActors'

export const Route = createFileRoute('/world/$worldId/_world/actors')({
	component: WorldActors,
})
