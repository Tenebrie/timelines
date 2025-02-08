import { createFileRoute } from '@tanstack/react-router'

import { EventDeltaCreator } from '@/app/features/worldTimeline/components/EventEditor/EventDeltaEditor/EventDeltaCreator'

export const Route = createFileRoute('/world/$worldId/_world/timeline/_timeline/event/$eventId/delta/create')(
	{
		component: EventDeltaCreator,
	},
)
