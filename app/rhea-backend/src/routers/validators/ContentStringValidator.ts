import { RequiredParam } from 'moonflower/validators/ParamWrappers'

const MAX_CONTENT_LENGTH = 32000

export const ContentStringValidator = RequiredParam({
	parse: (v) => String(v).trim(),
	validate: (v) => v.length <= MAX_CONTENT_LENGTH,
	description: `Any string value up to ${MAX_CONTENT_LENGTH} characters long`,
	errorMessage: `Must be at most ${MAX_CONTENT_LENGTH} characters long`,
})
