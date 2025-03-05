import { FileSystemService } from '@src/services/FileSystemService'
import {
	PathParam,
	RequiredParam,
	Router,
	StringValidator,
	useApiEndpoint,
	usePathParams,
	useReturnValue,
} from 'moonflower'
import { z } from 'zod'

const router = new Router()

router.get('/api/fs/image/:format/:filename', async (ctx) => {
	useApiEndpoint({
		name: 'loadFile',
		description: 'Returns the file as-is.',
	})

	const { format, filename } = usePathParams(ctx, {
		format: PathParam(ImageFormatValidator),
		filename: PathParam(StringValidator),
	})

	const filenameWithoutExtension = filename.split('.').slice(0, -1).join('.')
	const file = await FileSystemService.loadFile(filenameWithoutExtension)
	// TODO: Add Moonflower support for union types in useReturnValue
	return useReturnValue(file, 200, `image/${format}` as 'image/webp')
})

const supportedFormats = ['png', 'jpg', 'jpeg', 'gif', 'webp'] as const

export const ImageFormatValidator = RequiredParam({
	parse: (v) => z.enum(supportedFormats).parse(v),
	description: 'The image file extension',
	errorMessage: `Invalid image format. Supported formats: ${supportedFormats.join(', ')}`,
})

export const FileSystemRouter = router
