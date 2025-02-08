import { createFileRoute } from '@tanstack/react-router'

import { WorldWiki } from '@/app/features/worldWiki/WorldWiki'

export const Route = createFileRoute('/world/$worldId/_world/wiki/_wiki')({
	component: WorldWiki,
})
