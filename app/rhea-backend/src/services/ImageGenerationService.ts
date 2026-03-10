import { GoogleGenAI, Modality, PartUnion } from '@google/genai'
import { Asset, AssetStatus } from '@prisma/client'

import { SecretService } from '../ts-shared/node/services/SecretService.js'
import { AssetService } from './AssetService.js'
import { CloudStorageService } from './CloudStorageService.js'
import { ImageService } from './ImageService.js'
import { RedisService } from './RedisService.js'

let genAIClient: GoogleGenAI | null = null

const getClient = (): GoogleGenAI => {
	if (!genAIClient) {
		const apiKey = SecretService.getSecret('imagen-google-api-key')
		genAIClient = new GoogleGenAI({ apiKey })
	}
	return genAIClient
}

const isImageGenModel = (model: { name?: string; supportedActions?: string[] }): boolean => {
	// Imagen models use 'predict'
	if (model.name?.includes('imagen') && model.supportedActions?.includes('predict')) {
		return true
	}
	// Gemini image models use 'generateContent' and have 'image' in the name
	if (model.name?.includes('image') && model.supportedActions?.includes('generateContent')) {
		return true
	}
	return false
}

const isImagenModel = (modelId: string): boolean => modelId.includes('imagen')

export const ImageGenerationService = {
	listModels: async () => {
		const client = getClient()
		const pager = await client.models.list()
		const models: { id: string; name: string }[] = []
		for await (const model of pager) {
			if (model.name && isImageGenModel(model)) {
				models.push({
					id: model.name.replace(/^models\//, ''),
					name: model.displayName || model.name,
				})
			}
		}
		return models
	},

	generateImage: async ({
		prompt,
		model,
		referenceImages,
	}: {
		prompt: string
		model: string
		referenceImages: { base64: string; mimeType: string }[]
	}): Promise<{ imageBytes: Buffer; mimeType: string }> => {
		const client = getClient()

		if (isImagenModel(model)) {
			const response = await client.models.generateImages({
				model,
				prompt,
				config: {
					numberOfImages: 1,
				},
			})

			const generatedImage = response.generatedImages?.[0]
			if (!generatedImage?.image?.imageBytes) {
				throw new Error('No image generated — the API returned no image data')
			}

			return {
				imageBytes: Buffer.from(generatedImage.image.imageBytes, 'base64'),
				mimeType: generatedImage.image.mimeType || 'image/png',
			}
		}

		const contentParts: PartUnion[] = [
			...referenceImages.map((ref) => ({
				inlineData: { data: ref.base64, mimeType: ref.mimeType },
			})),
			prompt,
		]

		const response = await client.models.generateContent({
			model,
			contents: contentParts,
			config: {
				responseModalities: [Modality.IMAGE],
			},
		})

		const parts = response.candidates?.[0]?.content?.parts
		if (!parts || parts.length === 0) {
			throw new Error('No image generated — the API returned no content parts')
		}

		const imagePart = parts.find((p) => p.inlineData?.data)
		if (!imagePart?.inlineData?.data) {
			throw new Error('No image data in response')
		}

		return {
			imageBytes: Buffer.from(imagePart.inlineData.data, 'base64'),
			mimeType: imagePart.inlineData.mimeType || 'image/png',
		}
	},

	requestGeneration: async ({
		prompt,
		model,
		userId,
		referenceImages,
	}: {
		prompt: string
		model: string
		userId: string
		referenceImages: { base64: string; mimeType: string }[]
	}): Promise<Asset[]> => {
		const now = new Date()
		const dateStr = now.toISOString().replace(/T/, '-').replace(/:/g, '-').split('.')[0]
		const expiresAt = new Date(now.getTime() + 28 * 24 * 60 * 60 * 1000) // 4 weeks

		const pendingAssets: Asset[] = []
		const fileName = `NeverkinImage-${dateStr}.png`

		const assetId = crypto.randomUUID()

		const asset = await AssetService.createAsset({
			id: assetId,
			size: 0,
			originalFileName: fileName.replace(/\.png$/, ''),
			originalFileExtension: 'png',
			contentType: 'ImageGeneration',
			status: 'Pending',
			expiresAt,
			contentDescription: prompt,
			bucketKey: CloudStorageService.getUploadKey({
				id: assetId,
				ownerId: userId,
				originalFileExtension: 'png',
				contentType: 'ImageGeneration',
			}),
			owner: {
				connect: { id: userId },
			},
		})

		pendingAssets.push(asset)

		void (async () => {
			for (const asset of pendingAssets) {
				try {
					const result = await ImageGenerationService.generateImage({
						prompt,
						model,
						referenceImages,
					})

					const extension = result.mimeType === 'image/png' ? 'png' : 'webp'

					const validatedBuffer = await ImageService.validateImage(result.imageBytes)

					const uploadedAsset = await CloudStorageService.uploadGeneratedImage({
						assetId: asset.id,
						userId,
						fileName: `${asset.originalFileName}.${extension}`,
						fileBuffer: validatedBuffer.buffer,
						imageWidth: validatedBuffer.width,
						imageHeight: validatedBuffer.height,
					})

					RedisService.notifyAboutImageGeneration({
						userId,
						assetId: uploadedAsset.id,
						status: 'Finalized',
					})
				} catch (error) {
					console.error(`Image generation failed for asset ${asset.id}:`, error)

					await AssetService.updateAsset(asset.id, {
						status: AssetStatus.Failed,
					})

					RedisService.notifyAboutImageGeneration({
						userId,
						assetId: asset.id,
						status: 'Failed',
					})
				}
			}
		})()

		return pendingAssets
	},
}
