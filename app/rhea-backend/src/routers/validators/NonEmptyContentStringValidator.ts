import { RequiredParam } from 'moonflower'

const MAX_CONTENT_LENGTH = 32000

export const NonEmptyContentStringValidator = RequiredParam({
	parse: (v) => String(v).trim(),
	validate: (v) => v.length > 0 && v.length <= MAX_CONTENT_LENGTH,
	description: `Any string value between 1 and ${MAX_CONTENT_LENGTH} characters long`,
	errorMessage: `Must be between 1 and ${MAX_CONTENT_LENGTH} characters long`,
})
