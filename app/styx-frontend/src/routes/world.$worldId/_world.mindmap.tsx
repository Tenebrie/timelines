import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

import { MindmapView } from '@/app/views/world/views/mindmap/MindmapView'

const mindmapSearchSchema = z.object({
	selection: z.array(z.string()).default([]),
})

export const Route = createFileRoute('/world/$worldId/_world/mindmap')({
	component: RouteComponent,
	validateSearch: mindmapSearchSchema,
})

function RouteComponent() {
	return <MindmapView />
}
