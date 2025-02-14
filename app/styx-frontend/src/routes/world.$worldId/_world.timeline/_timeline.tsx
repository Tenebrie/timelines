import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

import { TimelineTrackManager } from '@/app/features/worldTimeline/components/Timeline/components/TimelineTracks/components/TimelineTrackManager'
import { WorldTimeline } from '@/app/features/worldTimeline/WorldTimeline'

const timelineSearchSchema = z.object({
	selection: z.array(z.string()).default([]),
})

export const Route = createFileRoute('/world/$worldId/_world/timeline/_timeline')({
	component: WorldTimelineComponent,
	validateSearch: timelineSearchSchema,
})

function WorldTimelineComponent() {
	return (
		<>
			<WorldTimeline />
			<TimelineTrackManager />
		</>
	)
}
