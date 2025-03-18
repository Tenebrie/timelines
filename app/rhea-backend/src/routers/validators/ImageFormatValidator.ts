import { ImageFormatSchema, SUPPORTED_IMAGE_FORMATS } from '@src/schema/ImageFormat'
import { RequiredParam } from 'moonflower/validators/ParamWrappers'

export const ImageFormatValidator = RequiredParam({
	parse: (v) => ImageFormatSchema.parse(v),
	description: `Image format. Must be one of: ${SUPPORTED_IMAGE_FORMATS.join(', ')}`,
	errorMessage: `Invalid image format. Supported formats: ${SUPPORTED_IMAGE_FORMATS.join(', ')}`,
})
