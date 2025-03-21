import { GetObjectCommand, HeadObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { createPresignedPost } from '@aws-sdk/s3-presigned-post'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { Asset, AssetStatus, AssetType, User, UserLevel } from '@prisma/client'
import { BadRequestError } from 'moonflower'

import { AssetService } from './AssetService'
import { SecretService } from './SecretService'

const BUCKET_ID = SecretService.getSecret('s3-bucket-id')

const s3Client = new S3Client({
	forcePathStyle: SecretService.getSecret('environment') === 'development',
	endpoint: SecretService.getSecret('s3-endpoint'),
	region: 'us-east-1',
	credentials: {
		accessKeyId: SecretService.getSecret('s3-access-key-id'),
		secretAccessKey: SecretService.getSecret('s3-access-key-secret'),
	},
})

export const CloudStorageService = {
	getFileAsBuffer: async (bucketKey: string) => {
		const command = new GetObjectCommand({
			Bucket: BUCKET_ID,
			Key: bucketKey,
		})
		const output = await s3Client.send(command)
		if (!output.Body) {
			throw new BadRequestError('Target asset is not valid')
		}
		return Buffer.from(await output.Body.transformToByteArray())
	},

	getUserSingleFileLimit: async (user: User) => {
		const megabyte = 1024 * 1024 // 1 MB
		switch (user.level) {
			case UserLevel.Free:
				return 10 * megabyte
			case UserLevel.Premium:
				return 100 * megabyte
			case UserLevel.Admin:
				return 300 * megabyte
		}
	},

	getUserRemainingQuota: async (user: User) => {
		const totalQuota = (() => {
			const megabyte = 1024 * 1024 // 1 MB
			const gigabyte = megabyte * 1024 // 1 GB
			switch (user.level) {
				case UserLevel.Free:
					return 100 * megabyte
				case UserLevel.Premium:
					return 1 * gigabyte
				case UserLevel.Admin:
					return 10 * gigabyte
			}
		})()
		const usedQuota = await AssetService.getUsedQuota(user.id)
		return totalQuota - usedQuota
	},

	getUploadKey: (asset: Pick<Asset, 'id' | 'ownerId' | 'originalFileExtension' | 'contentType'>) => {
		const bucketKey = `rhea/users/${asset.ownerId}/${asset.contentType.toLowerCase()}/${asset.id}`
		return CloudStorageService.appendFileExtension(bucketKey, asset.originalFileExtension)
	},

	appendFileExtension: (fileName: string, extension: string) => {
		const safeExtension = extension.replace(/[^a-zA-Z0-9]|^\.+/g, '')
		return `${fileName}${safeExtension ? '.' + safeExtension : ''}`
	},

	ensureStorageQuota: async (user: User, fileSize: number) => {
		const singleFileLimit = await CloudStorageService.getUserSingleFileLimit(user)
		if (fileSize > singleFileLimit) {
			throw new BadRequestError('File size exceeds the maximum allowed size')
		}

		const usedQuota = await AssetService.getUsedQuota(user.id)
		const totalQuota = await CloudStorageService.getUserRemainingQuota(user)
		if (usedQuota + fileSize > totalQuota) {
			throw new BadRequestError('Insufficient storage quota')
		}
	},

	createUploadPresignedUrl: async ({
		userId,
		fileName,
		fileSize,
		assetType,
	}: {
		userId: string
		fileName: string
		fileSize: number
		assetType: AssetType
	}) => {
		const assetId = crypto.randomUUID()
		const filenameOnly = fileName.split('.').slice(0, -1).join('.')
		const extension = fileName.split('.').pop() ?? ''

		const asset = await AssetService.createAsset({
			id: assetId,
			size: fileSize,
			originalFileName: filenameOnly,
			originalFileExtension: extension,
			contentType: assetType,
			bucketKey: CloudStorageService.getUploadKey({
				id: assetId,
				ownerId: userId,
				originalFileExtension: extension,
				contentType: assetType,
			}),
			expiresAt: new Date(Date.now() + 3600 * 1000), // 1 hour from now
			owner: {
				connect: {
					id: userId,
				},
			},
		})

		const { url, fields } = await createPresignedPost(s3Client, {
			Bucket: BUCKET_ID,
			Key: asset.bucketKey,
			Conditions: [['content-length-range', 0, fileSize]],
			Expires: 1800, // 30 minutes
		})

		const publicUrl = url.replace('s3-minio:9000', 'localhost')

		return { asset, url: publicUrl, fields: fields as Record<string, string> }
	},

	finalizeAssetUpload: async (assetId: string) => {
		const asset = await AssetService.getAsset(assetId)
		if (!asset) {
			throw new BadRequestError('Target asset is not valid')
		}

		// If already finalized, we're done
		if (asset.status === AssetStatus.Finalized) {
			return asset
		}

		// Check if file exists in S3
		try {
			await s3Client.send(
				new HeadObjectCommand({
					Bucket: BUCKET_ID,
					Key: asset.bucketKey,
				}),
			)

			// If we get here, file exists in S3. Mark as finalized.
			return await AssetService.updateAsset(assetId, { status: AssetStatus.Finalized })
		} catch (error: unknown) {
			if (error instanceof Error && error.name === 'NotFound') {
				// File doesn't exist in S3
				return asset
			}
			throw error
		}
	},

	uploadAsset: async ({
		userId,
		fileName,
		fileBuffer,
		assetType,
		expiresAt,
	}: {
		userId: string
		fileName: string
		fileBuffer: Buffer
		assetType: AssetType
		expiresAt?: Date
	}): Promise<Asset> => {
		const assetId = crypto.randomUUID()
		const filenameOnly = fileName.split('.').slice(0, -1).join('.')
		const extension = fileName.split('.').pop() ?? ''
		const fileSize = fileBuffer.length

		// Create the asset record
		const asset = await AssetService.createAsset({
			id: assetId,
			size: fileSize,
			originalFileName: filenameOnly,
			originalFileExtension: extension,
			contentType: assetType,
			expiresAt,
			bucketKey: CloudStorageService.getUploadKey({
				id: assetId,
				ownerId: userId,
				originalFileExtension: extension,
				contentType: assetType,
			}),
			owner: {
				connect: {
					id: userId,
				},
			},
		})

		// Upload the file to S3
		await s3Client.send(
			new PutObjectCommand({
				Bucket: BUCKET_ID,
				Key: asset.bucketKey,
				Body: fileBuffer,
			}),
		)

		// Finalize the asset
		return await CloudStorageService.finalizeAssetUpload(assetId)
	},

	getPresignedUrl: async (assetOrId: string | Asset, expiresInSeconds: number = 3600) => {
		const asset = await (async () => {
			if (typeof assetOrId === 'object') {
				return assetOrId
			}

			const asset = await AssetService.getAsset(assetOrId)
			if (!asset) {
				throw new BadRequestError('Target asset is not valid')
			}
			return asset
		})()

		if (asset.status !== AssetStatus.Finalized) {
			throw new BadRequestError('Asset is not ready for download')
		}

		const command = new GetObjectCommand({
			Bucket: BUCKET_ID,
			Key: asset.bucketKey,
		})

		const url = await getSignedUrl(s3Client, command, { expiresIn: expiresInSeconds })
		const publicUrl = url.replace('s3-minio:9000', 'localhost')
		return publicUrl
	},
}
