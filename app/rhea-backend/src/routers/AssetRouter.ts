import { UserAuthenticator } from '@src/middleware/auth/UserAuthenticator'
import { AuthorizationService } from '@src/services/AuthorizationService'
import { CloudStorageService } from '@src/services/CloudStorageService'
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

import { AssetTypeValidator } from './validators/AssetTypeValidator'

const router = new Router()

router.get('/api/assets/:assetId', async (ctx) => {
	useApiEndpoint({
		name: 'getAsset',
		description: 'Gets a presigned URL for an asset.',
	})

	const { assetId } = usePathParams(ctx, {
		assetId: RequiredParam(StringValidator),
	})

	const user = await useAuth(ctx, UserAuthenticator)
	await AuthorizationService.checkUserAssetAccess(user.id, assetId)

	const url = await CloudStorageService.getPresignedUrl(assetId)
	return { url }
})

router.post('/api/assets/upload/presigned', async (ctx) => {
	useApiEndpoint({
		name: 'requestPresignedUrl',
		description: 'Requests a presigned URL for a file upload.',
	})

	const { fileName, fileSize, assetType } = useRequestBody(ctx, {
		fileName: RequiredParam(StringValidator),
		fileSize: RequiredParam(NumberValidator),
		assetType: RequiredParam(AssetTypeValidator),
	})

	const user = await useAuth(ctx, UserAuthenticator)

	await CloudStorageService.ensureStorageQuota(user, fileSize)

	const { asset, url, fields } = await CloudStorageService.createUploadPresignedUrl({
		userId: user.id,
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
	})

	const { assetId } = useRequestBody(ctx, {
		assetId: RequiredParam(StringValidator),
	})

	const user = await useAuth(ctx, UserAuthenticator)
	await AuthorizationService.checkUserAssetAccess(user.id, assetId)
	return await CloudStorageService.finalizeAssetUpload(assetId)
})

export const AssetUploadRouter = router
