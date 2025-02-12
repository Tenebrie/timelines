import { createFileRoute } from '@tanstack/react-router'

import { ArticleDetails } from '@/app/features/worldWiki/components/ArticleDetails/ArticleDetails'

export const Route = createFileRoute('/world/$worldId/_world/wiki/_wiki/$articleId')({
	component: ArticleDetailsComponent,
})

function ArticleDetailsComponent() {
	return <ArticleDetails />
}
