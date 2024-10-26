import { WorldAccessMode } from '@prisma/client'
import { keysOf } from '@src/utils/keysOf'
import { Router, useApiEndpoint } from 'moonflower'

const router = new Router()

router.get('/api/constants/world-access-modes', async () => {
	useApiEndpoint({
		name: 'listWorldAccessModes',
		description: 'Lists all available world access modes.',
	})

	return keysOf(WorldAccessMode)
})

export const ConstantsRouter = router
