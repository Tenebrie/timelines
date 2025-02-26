import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

import { TimelineTrackManager } from '@/app/views/world/views/timeline/components/TimelineTracks/components/TimelineTrackManager'
import { TimelineView } from '@/app/views/world/views/timeline/components/TimelineView'

const timelineSearchSchema = z.object({
	selection: z.array(z.string()).default([]),
})

export const Route = createFileRoute('/world/$worldId/_world/timeline')({
	component: WorldTimelineComponent,
	validateSearch: timelineSearchSchema,
})

function WorldTimelineComponent() {
	return (
		<>
			<TimelineView />
			<TimelineTrackManager />
		</>
	)
}
