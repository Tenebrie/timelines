import { createFileRoute } from '@tanstack/react-router'

import { ArticleDetails } from '@/app/views/world/views/wiki/article/details/ArticleDetails'

export const Route = createFileRoute('/world/$worldId/_world/wiki/_wiki/$articleId')({
	component: RouteComponent,
})

function RouteComponent() {
	return <ArticleDetails />
}
