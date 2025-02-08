import { createFileRoute } from '@tanstack/react-router'

import { ActorEditor } from '@/app/features/worldTimeline/components/ActorEditor/ActorEditor'

export const Route = createFileRoute('/world/$worldId/_world/timeline/_timeline/actor/$actorId')({
	component: ActorEditor,
})
