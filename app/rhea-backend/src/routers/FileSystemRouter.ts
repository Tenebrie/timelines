import { FileSystemService } from '@src/services/FileSystemService'
import { PathParam, Router, StringValidator, useApiEndpoint, usePathParams, useReturnValue } from 'moonflower'

const router = new Router()

router.get('/api/fs/image/:format/:filename', async (ctx) => {
	useApiEndpoint({
		name: 'loadFile',
		description: 'Returns the file as-is.',
	})

	const { format, filename } = usePathParams(ctx, {
		format: PathParam(StringValidator),
		filename: PathParam(StringValidator),
	})

	const filenameWithoutExtension = filename.split('.').slice(0, -1).join('.')
	const file = await FileSystemService.loadFile(filenameWithoutExtension)
	return useReturnValue(file, 200, `image/${format}`)
})

export const FileSystemRouter = router
