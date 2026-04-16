import { RequiredParam } from 'moonflower'
import { z } from 'zod'

const zodSchema = z.array(
	z.object({
		base64: z.string(),
		mimeType: z.string(),
	}),
)

export type ReferenceImagesArray = z.infer<typeof zodSchema>

export const ReferenceImagesArrayValidator = RequiredParam({
	parse: (v) => {
		if (!v) {
			return []
		}
		try {
			return zodSchema.parse(JSON.parse(v))
		} catch (error) {
			console.error(error)
			throw error
		}
	},
	description: 'An array of reference images with base64 data and mimeType',
	errorMessage: 'Must be an array of objects with base64 and mimeType fields',
})
