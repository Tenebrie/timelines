import { createFileRoute } from '@tanstack/react-router'

import { WorldDetails } from '@/app/features/worldSettings/WorldSettings'

export const Route = createFileRoute('/world/$worldId/_world/settings')({
	component: WorldDetailsComponent,
})

function WorldDetailsComponent() {
	return <WorldDetails />
}
