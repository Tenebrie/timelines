import { createFileRoute } from '@tanstack/react-router'

import { WorldShareView } from '@/app/views/share/WorldShareView'

export const Route = createFileRoute('/share/$shareLinkSlug')({
	component: RouteComponent,
})

function RouteComponent() {
	return <WorldShareView />
}
