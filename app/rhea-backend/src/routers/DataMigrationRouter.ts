import { UserAuthMiddleware } from '@src/middleware/UserAuthMiddleware.js'
import { DataMigrationService } from '@src/services/DataMigrationService.js'
import { Router, useApiEndpoint, useRequestBody } from 'moonflower'
import z from 'zod'

import { dataMigrationTag } from './utils/tags.js'

const router = new Router().with(UserAuthMiddleware)

router.post('/api/import/user-data', async (ctx) => {
	useApiEndpoint({
		name: 'importUserData',
		description: 'Import user data in JSON format',
		tags: [dataMigrationTag],
	})

	const { data } = useRequestBody(ctx, {
		data: z.object({
			data: z.string(),
		}),
	})

	return DataMigrationService.importUserData(ctx, data.data)
})

router.post('/api/export/user-data', async (ctx) => {
	useApiEndpoint({
		name: 'exportUserData',
		description: 'Export user data in JSON format',
		tags: [dataMigrationTag],
	})

	return DataMigrationService.exportUserData(ctx)
})

export const DataMigrationRouter = router
