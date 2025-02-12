import { createFileRoute } from '@tanstack/react-router'

import { EventEditor } from '@/app/features/worldTimeline/components/EventEditor/EventEditor'

export const Route = createFileRoute('/world/$worldId/_world/timeline/_timeline/event/$eventId')({
	component: EventEditorComponent,
})

function EventEditorComponent() {
	return <EventEditor />
}
