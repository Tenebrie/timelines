import { UserAuthMiddleware } from '@src/middleware/UserAuthMiddleware.js'
import { AuditLogService } from '@src/services/AuditLogService.js'
import { DataMigrationService } from '@src/services/DataMigrationService.js'
import { Router, useApiEndpoint, useRequestBody } from 'moonflower'
import z from 'zod'

import { dataMigrationTag } from './utils/tags.js'

const router = new Router().with(UserAuthMiddleware)

router.post('/api/import/user-data/validate', async (ctx) => {
	useApiEndpoint({
		name: 'validateImportUserData',
		description: 'Perform a dry run of user data import.',
		tags: [dataMigrationTag],
	})

	const { data } = useRequestBody(ctx, {
		data: z.object({
			json: z.string(),
		}),
	})

	try {
		await DataMigrationService.isImportValid(ctx, data.json)
		AuditLogService.append(ctx, {
			action: 'UserValidateImportData',
			userEmail: ctx.user.email,
			data: {
				inputSize: data.json.length,
			},
		})
	} catch (error) {
		AuditLogService.append(ctx, {
			action: 'UserValidateImportDataFailed',
			userEmail: ctx.user.email,
			data: {
				inputSize: data.json.length,
				error: error instanceof Error ? error.message : String(error),
			},
		})
		throw error
	}
})

router.post('/api/import/user-data/commit', async (ctx) => {
	useApiEndpoint({
		name: 'importUserData',
		description: 'Import user data in JSON format',
		tags: [dataMigrationTag],
	})

	const { data } = useRequestBody(ctx, {
		data: z.object({
			json: z.string(),
		}),
	})

	try {
		await DataMigrationService.importUserData(ctx, data.json, { dryRun: false })
		AuditLogService.append(ctx, {
			action: 'UserImportData',
			userEmail: ctx.user.email,
			data: {
				inputSize: data.json.length,
			},
		})
	} catch (error) {
		AuditLogService.append(ctx, {
			action: 'UserImportDataFailed',
			userEmail: ctx.user.email,
			data: {
				inputSize: data.json.length,
				error: error instanceof Error ? error.message : String(error),
			},
		})
		throw error
	}
})

router.post('/api/export/user-data', async (ctx) => {
	useApiEndpoint({
		name: 'exportUserData',
		description: 'Export user data in JSON format',
		tags: [dataMigrationTag],
	})

	try {
		const data = await DataMigrationService.exportUserData(ctx)
		AuditLogService.append(ctx, {
			action: 'UserExportData',
			userEmail: ctx.user.email,
			data: {},
		})
		return data
	} catch (error) {
		AuditLogService.append(ctx, {
			action: 'UserExportDataFailed',
			userEmail: ctx.user.email,
			data: {
				error: error instanceof Error ? error.message : String(error),
			},
		})
		throw error
	}
})

export const DataMigrationRouter = router
