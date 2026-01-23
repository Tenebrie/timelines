import { createFileRoute } from '@tanstack/react-router'

import { TimelineView } from '@/app/views/world/views/timeline/TimelineView'
import { TimelineTrackReporter } from '@/app/views/world/views/timeline/tracks/components/TimelineTrackReporter'

export const Route = createFileRoute('/world/$worldId/_world/timeline')({
	component: RouteComponent,
})

function RouteComponent() {
	return (
		<>
			<TimelineView />
			<TimelineTrackReporter />
		</>
	)
}
