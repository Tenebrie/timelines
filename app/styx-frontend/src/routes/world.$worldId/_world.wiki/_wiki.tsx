import { createFileRoute } from '@tanstack/react-router'

import { Wiki } from '@/app/views/world/views/wiki/Wiki'

export const Route = createFileRoute('/world/$worldId/_world/wiki/_wiki')({
	component: RouteComponent,
})

function RouteComponent() {
	return <Wiki />
}
