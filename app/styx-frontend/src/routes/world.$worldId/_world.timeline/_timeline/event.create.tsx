import { createFileRoute } from '@tanstack/react-router'

import { EventCreatorWrapper } from '@/app/features/worldTimeline/components/EventEditor/EventCreatorWrapper'

export const Route = createFileRoute('/world/$worldId/_world/timeline/_timeline/event/create')({
	component: EventCreatorWrapper,
})
