import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

import { TimelineView } from '@/app/views/world/views/timeline/components/TimelineView'
import { TimelineTrackReporter } from '@/app/views/world/views/timeline/tracks/components/TimelineTrackReporter'

const timelineSearchSchema = z.object({
	track: z.string().optional(),
})

export const Route = createFileRoute('/world/$worldId/_world/timeline')({
	component: RouteComponent,
	validateSearch: timelineSearchSchema,
})

function RouteComponent() {
	return (
		<>
			<TimelineView />
			<TimelineTrackReporter />
		</>
	)
}
