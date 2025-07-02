import { WorldAccessMode } from '@prisma/client'
import { keysOf } from '@src/utils/keysOf.js'
import { Router, useApiEndpoint } from 'moonflower'

const router = new Router()

router.get('/api/constants/admin-levels', async () => {
	useApiEndpoint({
		name: 'adminGetUserLevels',
		description: 'Get all available user levels',
		tags: [],
	})

	return ['Free', 'Premium', 'Admin'] as const
})

router.get('/api/constants/world-access-modes', async () => {
	useApiEndpoint({
		name: 'listWorldAccessModes',
		description: 'Lists all available world access modes.',
	})

	return keysOf(WorldAccessMode)
})

export const ConstantsRouter = router
