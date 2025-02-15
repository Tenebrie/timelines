import { createFileRoute } from '@tanstack/react-router'

import { EventDeltaEditor } from '@/app/features/worldTimeline/components/EventEditor/EventDeltaEditor/EventDeltaEditor'

export const Route = createFileRoute('/world/$worldId/_world/timeline/_timeline/delta/$deltaId/$eventId')({
	component: EventDeltaEditorComponent,
})

function EventDeltaEditorComponent() {
	return <EventDeltaEditor />
}
