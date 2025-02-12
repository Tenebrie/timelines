import { createFileRoute } from '@tanstack/react-router'

import { WorldOverview } from '@/app/features/worldOverview/WorldOverview'

export const Route = createFileRoute('/world/$worldId/_world/overview')({
	component: WorldOverviewComponent,
})

function WorldOverviewComponent() {
	return <WorldOverview />
}
