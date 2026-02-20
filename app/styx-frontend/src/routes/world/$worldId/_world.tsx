import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

import { loadPreferences } from '@/app/features/preferences/utils/loadPreferences'
import { THE_END } from '@/app/features/time/hooks/useWorldTime'
import { ScaleLevelSchema } from '@/app/schema/ScaleLevel'
import { World } from '@/app/views/world/World'

const worldSearchSchema = z.object({
	new: z.enum(['event', 'actor']).optional(),
	navi: z.array(z.string()).default([]),
	time: z.number().min(-THE_END).max(THE_END).default(0),
	scale: ScaleLevelSchema.default(loadPreferences().timeline.scaleLevel),
	track: z.string().optional(),
	tab: z.number().min(0).max(1).default(0),
	iq: z.string().optional(), // Icon search query
})

export const Route = createFileRoute('/world/$worldId/_world')({
	component: RouteComponent,
	validateSearch: worldSearchSchema,
})

function RouteComponent() {
	return <World />
}

export const WorldRoute = Route
