import { FileSystemService } from '@src/services/FileSystemService'
import { ImageService } from '@src/services/ImageService'
import {
	NumberValidator,
	OptionalParam,
	RequiredParam,
	Router,
	StringValidator,
	useApiEndpoint,
	useRequestBody,
} from 'moonflower'

import { Base64ImageValidator } from './validators/Base64ImageValidator'

const router = new Router()

router.post('/api/images/convert', async (ctx) => {
	useApiEndpoint({
		name: 'convertImage',
		description: 'Converts an image to a different format.',
	})

	const body = useRequestBody(ctx, {
		image: RequiredParam(Base64ImageValidator),
		format: OptionalParam(StringValidator),
		width: OptionalParam(NumberValidator),
		height: OptionalParam(NumberValidator),
		quality: OptionalParam(NumberValidator),
	})

	const metadata = await ImageService.validateImage(body.image)
	const convertedImage = await ImageService.convertImage(body)
	const path = await FileSystemService.saveFile(convertedImage)
	return { metadata, path }
})

export const ImageConversionRouter = router
