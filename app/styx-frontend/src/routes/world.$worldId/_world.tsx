import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

import { loadPreferences } from '@/app/features/preferences/loadPreferences'
import { ScaleLevelSchema } from '@/app/schema/ScaleLevel'
import { World } from '@/app/views/world/World'

const worldSearchSchema = z.object({
	time: z.number().min(-8640000000000000).max(8640000000000000).default(0),
	scale: ScaleLevelSchema.default(loadPreferences().timeline.scaleLevel),
})

export const Route = createFileRoute('/world/$worldId/_world')({
	component: WorldComponent,
	validateSearch: worldSearchSchema,
})

function WorldComponent() {
	return <World />
}

export const WorldRoute = Route
