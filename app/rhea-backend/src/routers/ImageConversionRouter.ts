import { UserAuthenticator } from '@src/middleware/auth/UserAuthenticator'
import { SUPPORTED_IMAGE_FORMATS } from '@src/schema/ImageFormat'
import { AssetService } from '@src/services/AssetService'
import { CloudStorageService } from '@src/services/CloudStorageService'
import { ImageService } from '@src/services/ImageService'
import {
	BadRequestError,
	NumberValidator,
	OptionalParam,
	RequiredParam,
	Router,
	StringValidator,
	useApiEndpoint,
	useAuth,
	useRequestBody,
} from 'moonflower'

import { ImageFormatValidator } from './validators/ImageFormatValidator'

const router = new Router()

router.get('/api/images/formats', async () => {
	useApiEndpoint({
		name: 'getSupportedImageFormats',
		description: 'Returns a list of supported image formats for conversion.',
	})

	return {
		formats: SUPPORTED_IMAGE_FORMATS,
	}
})

router.post('/api/images/convert', async (ctx) => {
	useApiEndpoint({
		name: 'requestImageConversion',
		description: 'Requests an image conversion.',
	})

	const body = useRequestBody(ctx, {
		assetId: RequiredParam(StringValidator),
		format: RequiredParam(ImageFormatValidator),
		width: OptionalParam(NumberValidator),
		height: OptionalParam(NumberValidator),
		quality: OptionalParam(NumberValidator),
	})

	const user = await useAuth(ctx, UserAuthenticator)

	const asset = await AssetService.getAsset(body.assetId)
	if (!asset || asset.ownerId !== user.id) {
		throw new BadRequestError('Target asset is not valid')
	}

	const imageBuffer = await CloudStorageService.getFileAsBuffer(asset.bucketKey)
	const convertedImage = await ImageService.convertImage({
		image: imageBuffer,
		format: body.format,
		width: body.width,
		height: body.height,
		quality: body.quality,
	})

	const convertedAsset = await CloudStorageService.uploadAsset({
		userId: user.id,
		fileName: CloudStorageService.appendFileExtension(asset.originalFileName, body.format),
		fileBuffer: convertedImage,
		assetType: asset.contentType,
		expiresAt: new Date(Date.now() + 1 * 60 * 60 * 1000),
	})

	return convertedAsset
})

export const ImageConversionRouter = router
