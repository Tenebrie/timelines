import { ImageFormat } from '@src/schema/ImageFormat'
import { BadRequestError } from 'moonflower'
import * as sharp from 'sharp'

export const ImageService = {
	validateImage: async (image: Buffer) => {
		try {
			const metadata = await sharp(image).metadata()
			if (!metadata.format) {
				throw new BadRequestError('Unsupported image format')
			}
			return metadata
		} catch (error) {
			console.info('Supplied file is not an image', error)
			throw new BadRequestError('Supplied file is not an image')
		}
	},

	convertImage: async (params: {
		image: Buffer
		format: ImageFormat
		width?: number
		height?: number
		quality?: number
	}) => {
		try {
			const draft = sharp(params.image)
			if (params.width && params.height) {
				draft.resize(params.width, params.height)
			}
			const format = params.format
			const quality = params.quality ?? 80
			switch (format) {
				case 'webp':
					draft.webp({ quality })
					break
				case 'jpeg':
					draft.jpeg({ quality })
					break
				case 'png':
					draft.png({ quality })
					break
				case 'gif':
					draft.gif({ colors: quality })
					break
				default:
					format satisfies never
			}
			return await draft.toBuffer()
		} catch (error) {
			console.info('Failed to convert image', error)
			throw new BadRequestError('Failed to convert image')
		}
	},
}
