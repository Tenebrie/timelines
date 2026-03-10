import { createFileRoute } from '@tanstack/react-router'

import { CurrentArticleDetails } from '@/app/views/world/views/wiki/Wiki'

export const Route = createFileRoute('/world/$worldId/_world/wiki/_wiki/$articleId')({
	component: RouteComponent,
})

function RouteComponent() {
	return <CurrentArticleDetails />
}
