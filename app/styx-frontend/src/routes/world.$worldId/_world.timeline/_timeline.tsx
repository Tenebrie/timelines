import { createFileRoute } from '@tanstack/react-router'

import { WorldTimeline } from '@/app/features/worldTimeline/WorldTimeline'

export const Route = createFileRoute('/world/$worldId/_world/timeline/_timeline')({
	component: WorldTimelineComponent,
})

function WorldTimelineComponent() {
	return <WorldTimeline />
}
