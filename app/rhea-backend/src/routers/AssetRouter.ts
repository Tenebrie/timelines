import { UserAuthenticator } from '@src/middleware/auth/UserAuthenticator.js'
import { AssetService } from '@src/services/AssetService.js'
import { AuthorizationService } from '@src/services/AuthorizationService.js'
import { CloudStorageService } from '@src/services/CloudStorageService.js'
import {
	NumberValidator,
	RequiredParam,
	Router,
	StringValidator,
	useApiEndpoint,
	useAuth,
	usePathParams,
	useRequestBody,
} from 'moonflower'

import { assetTag } from './utils/tags.js'
import { AssetTypeValidator } from './validators/AssetTypeValidator.js'

const router = new Router().with(async (ctx) => {
	return {
		user: await useAuth(ctx, UserAuthenticator),
	}
})

router.get('/api/assets/:assetId', async (ctx) => {
	useApiEndpoint({
		name: 'getAsset',
		description: 'Gets a presigned URL for an asset.',
		tags: [assetTag],
	})

	const { assetId } = usePathParams(ctx, {
		assetId: RequiredParam(StringValidator),
	})

	await AuthorizationService.checkUserAssetAccess(ctx.user.id, assetId)

	const url = await CloudStorageService.getPresignedUrl(assetId)
	return { url }
})

router.delete('/api/assets/:assetId', async (ctx) => {
	useApiEndpoint({
		name: 'deleteAsset',
		description: 'Deletes an asset owned by the user.',
		tags: [assetTag],
	})

	const { assetId } = usePathParams(ctx, {
		assetId: RequiredParam(StringValidator),
	})

	await AuthorizationService.checkUserAssetAccess(ctx.user.id, assetId)

	const asset = await AssetService.getAsset(assetId)
	if (!asset) {
		throw new Error('Asset not found')
	}

	await CloudStorageService.deleteAssetFile(asset)
})

router.get('/api/assets', async (ctx) => {
	useApiEndpoint({
		name: 'listUserAssets',
		description: 'List all assets owned by the user.',
		tags: [assetTag],
	})

	const assets = await AssetService.listUserAssets(ctx.user.id)
	return { assets }
})

router.post('/api/assets/upload/presigned', async (ctx) => {
	useApiEndpoint({
		name: 'requestPresignedUrl',
		description: 'Requests a presigned URL for a file upload.',
		tags: [assetTag],
	})

	const { fileName, fileSize, assetType } = useRequestBody(ctx, {
		fileName: RequiredParam(StringValidator),
		fileSize: RequiredParam(NumberValidator),
		assetType: RequiredParam(AssetTypeValidator),
	})

	await CloudStorageService.ensureStorageQuota(ctx.user, fileSize)

	const { asset, url, fields } = await CloudStorageService.createUploadPresignedUrl({
		userId: ctx.user.id,
		fileName,
		fileSize,
		assetType,
	})

	return {
		asset,
		url,
		fields,
	}
})

router.post('/api/assets/upload/finalize', async (ctx) => {
	useApiEndpoint({
		name: 'finalizeAssetUpload',
		description: 'Finalizes an asset upload.',
		tags: [assetTag],
	})

	const { assetId } = useRequestBody(ctx, {
		assetId: RequiredParam(StringValidator),
	})

	await AuthorizationService.checkUserAssetAccess(ctx.user.id, assetId)
	return await CloudStorageService.finalizeAssetUpload(assetId)
})

export const AssetUploadRouter = router
