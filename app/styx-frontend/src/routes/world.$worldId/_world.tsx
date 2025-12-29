import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

import { loadPreferences } from '@/app/features/preferences/utils/loadPreferences'
import { ScaleLevelSchema } from '@/app/schema/ScaleLevel'
import { World } from '@/app/views/world/World'

const worldSearchSchema = z.object({
	new: z.enum(['event', 'actor']).optional(),
	selection: z.array(z.string()).default([]),
	time: z.number().min(-8640000000000000).max(8640000000000000).default(0),
	scale: ScaleLevelSchema.default(loadPreferences().timeline.scaleLevel),
	track: z.string().optional(),
})

export const Route = createFileRoute('/world/$worldId/_world')({
	component: RouteComponent,
	validateSearch: worldSearchSchema,
})

function RouteComponent() {
	return <World />
}

export const WorldRoute = Route
