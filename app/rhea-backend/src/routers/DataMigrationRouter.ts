import { UserAuthMiddleware } from '@src/middleware/UserAuthMiddleware.js'
import { AssetService } from '@src/services/AssetService.js'
import { AuditLogService } from '@src/services/AuditLogService.js'
import { CloudStorageService } from '@src/services/CloudStorageService.js'
import { DataMigrationService } from '@src/services/DataMigrationService.js'
import { BadRequestError, Router, useApiEndpoint, useRequestBody } from 'moonflower'
import z from 'zod'

import { dataMigrationTag } from './utils/tags.js'

const router = new Router().with(UserAuthMiddleware)

router.post('/api/import/user-data/validate', async (ctx) => {
	useApiEndpoint({
		name: 'validateImportUserData',
		description: 'Perform a dry run of user data import.',
		tags: [dataMigrationTag],
	})

	const { assetId } = useRequestBody(ctx, {
		assetId: z.string(),
	})

	const asset = await AssetService.getAsset(assetId)
	if (!asset) {
		throw new BadRequestError('Asset not found')
	}

	if (asset.ownerId !== ctx.user.id) {
		throw new BadRequestError('Asset not found')
	}
	const data = await CloudStorageService.getFileAsString(asset.bucketKey)

	try {
		await DataMigrationService.isImportValid(ctx, data)
		AuditLogService.append(ctx, {
			action: 'UserValidateImportData',
			userEmail: ctx.user.email,
			data: {
				inputSize: data.length,
			},
		})
	} catch (error) {
		AuditLogService.append(ctx, {
			action: 'UserValidateImportDataFailed',
			userEmail: ctx.user.email,
			data: {
				inputSize: data.length,
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

	const { assetId } = useRequestBody(ctx, {
		assetId: z.string(),
	})

	const asset = await AssetService.getAsset(assetId)
	if (!asset) {
		throw new BadRequestError('Asset not found')
	}

	if (asset.ownerId !== ctx.user.id) {
		throw new BadRequestError('Asset not found')
	}
	const data = await CloudStorageService.getFileAsString(asset.bucketKey)

	try {
		await DataMigrationService.importUserData(ctx, data, { dryRun: false })
		AuditLogService.append(ctx, {
			action: 'UserImportData',
			userEmail: ctx.user.email,
			data: {
				inputSize: data.length,
			},
		})
	} catch (error) {
		AuditLogService.append(ctx, {
			action: 'UserImportDataFailed',
			userEmail: ctx.user.email,
			data: {
				inputSize: data.length,
				error: error instanceof Error ? error.message : String(error),
			},
		})
		throw error
	} finally {
		await CloudStorageService.deleteAssetFile(asset)
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
		const asset = await CloudStorageService.uploadAsset({
			userId: ctx.user.id,
			assetType: 'DataMigrationExport',
			fileBuffer: Buffer.from(
				JSON.stringify(data, (_k, v) => (typeof v === 'bigint' ? v.toString() : v)),
				'utf-8',
			),
			expiresAt: new Date(Date.now() + 1 * 60 * 60 * 1000), // 1 hour
			fileName: `DataExport-${Date.now()}.json`,
		})
		const presignedUrl = await CloudStorageService.getPresignedUrl(asset)
		return { url: presignedUrl }
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

router.post('/api/export/user-data/inline', async (ctx) => {
	useApiEndpoint({
		name: 'exportUserDataInline',
		description: 'Export user data in JSON format without using cloud storage',
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
