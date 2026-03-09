import { PremiumAuthenticator } from '@src/middleware/auth/PremiumAuthenticator.js'
import { AssetService } from '@src/services/AssetService.js'
import { CloudStorageService } from '@src/services/CloudStorageService.js'
import { ImageGenerationService } from '@src/services/ImageGenerationService.js'
import {
	BadRequestError,
	NumberValidator,
	OptionalParam,
	RequiredParam,
	Router,
	StringValidator,
	useApiEndpoint,
	useAuth,
	useQueryParams,
	useRequestBody,
} from 'moonflower'

import { imageGenerationTag } from './utils/tags.js'
import { ReferenceImagesArrayValidator } from './validators/ReferenceImagesArrayValidator.js'

const router = new Router()

/**
 * POST /api/images/generate
 * Accepts prompt, model, optional reference images, and number of images.
 * Creates Pending assets and responds immediately.
 * Asynchronously generates images via Google AI and uploads to S3.
 */
router.post('/api/images/generate', async (ctx) => {
	useApiEndpoint({
		name: 'requestImageGeneration',
		description: 'Requests AI image generation. Returns immediately with pending asset IDs.',
		tags: [imageGenerationTag],
	})

	const user = await useAuth(ctx, PremiumAuthenticator)

	const { prompt, model, numberOfImages, referenceImages } = useRequestBody(ctx, {
		prompt: RequiredParam(StringValidator),
		model: RequiredParam(StringValidator),
		numberOfImages: OptionalParam(NumberValidator),
		referenceImages: OptionalParam(ReferenceImagesArrayValidator),
	})

	if (!prompt || prompt.trim().length === 0) {
		throw new BadRequestError('Prompt is required')
	}
	if (prompt.length > 2000) {
		throw new BadRequestError('Prompt must be 2000 characters or fewer')
	}

	const availableModels = await ImageGenerationService.listModels()
	if (!availableModels.find((m) => m.id === model)) {
		throw new BadRequestError('Invalid model selected')
	}

	const references = referenceImages ?? []
	if (references.length > 5) {
		throw new BadRequestError('Maximum 5 reference images allowed')
	}
	const MAX_REF_SIZE = 1 * 1024 * 1024 // 1MB
	for (const ref of references) {
		if (!ref.base64 || !ref.mimeType) {
			throw new BadRequestError('Each reference image must have base64 and mimeType')
		}
		const sizeInBytes = Buffer.byteLength(ref.base64, 'base64')
		if (sizeInBytes > MAX_REF_SIZE) {
			throw new BadRequestError('Each reference image must be 1MB or smaller')
		}
	}

	const quota = await CloudStorageService.getUserRemainingQuota(user)
	if (quota.remaining <= 0) {
		throw new BadRequestError('Storage quota exceeded. Delete some assets to free up space.')
	}

	const pendingAssets = await ImageGenerationService.requestGeneration({
		prompt,
		model,
		numberOfImages: numberOfImages ?? 1,
		userId: user.id,
		referenceImages: references,
	})

	return {
		assets: pendingAssets.map((a) => ({
			id: a.id,
			status: a.status,
			createdAt: a.createdAt.toISOString(),
		})),
	}
})

/**
 * GET /api/images/generate/history
 * Returns the user's image generation history (most recent first).
 */
router.get('/api/images/generate/history', async (ctx) => {
	useApiEndpoint({
		name: 'getImageGenerationHistory',
		description: 'Returns the list of AI-generated images for the current user.',
		tags: [imageGenerationTag],
	})

	const user = await useAuth(ctx, PremiumAuthenticator)

	const { page, size } = useQueryParams(ctx, {
		page: OptionalParam(NumberValidator),
		size: OptionalParam(NumberValidator),
	})

	const result = await AssetService.listUserAssetsByTypePaginated(user.id, 'ImageGeneration', { page, size })

	return {
		assets: result.assets.map((a) => ({
			id: a.id,
			status: a.status,
			createdAt: a.createdAt.toISOString(),
			originalFileName: a.originalFileName,
			originalFileExtension: a.originalFileExtension,
			contentDescription: a.contentDescription,
			imageWidth: a.imageWidth,
			imageHeight: a.imageHeight,
		})),
		page: result.page,
		size: result.size,
		pageCount: result.pageCount,
	}
})

export const ImageGenerationRouter = router
