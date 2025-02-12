import { createFileRoute } from '@tanstack/react-router'

import { EventDeltaCreator } from '@/app/features/worldTimeline/components/EventEditor/EventDeltaEditor/EventDeltaCreator'

export const Route = createFileRoute('/world/$worldId/_world/timeline/_timeline/delta/create/$eventId')({
	component: EventDeltaCreatorComponent,
})

function EventDeltaCreatorComponent() {
	return <EventDeltaCreator />
}
