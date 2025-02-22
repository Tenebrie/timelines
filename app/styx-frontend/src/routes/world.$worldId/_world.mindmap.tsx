import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

import { WorldMindmap } from '@/app/features/worldMindmap/WorldMindmap'

const mindmapSearchSchema = z.object({
	selection: z.array(z.string()).default([]),
})

export const Route = createFileRoute('/world/$worldId/_world/mindmap')({
	component: RouteComponent,
	validateSearch: mindmapSearchSchema,
})

function RouteComponent() {
	return <WorldMindmap />
}
