import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

import { World } from '@/app/features/world/World'

import { checkUserAccess } from '../../router-utils/checkUserAccess'

const worldSearchSchema = z.object({
	time: z.number().default(0),
})

export const Route = createFileRoute('/world/$worldId/_world')({
	component: World,
	validateSearch: worldSearchSchema,
	beforeLoad: ({ context }) => {
		checkUserAccess(context)
	},
})
