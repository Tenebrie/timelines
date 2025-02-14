import { createFileRoute } from '@tanstack/react-router'

import { Outliner } from '@/app/features/worldTimeline/components/Outliner/Outliner'

export const Route = createFileRoute('/world/$worldId/_world/timeline/_timeline/event/$eventId')({
	component: EventEditorComponent,
})

function EventEditorComponent() {
	return <Outliner />
}
