import { RequiredParam } from 'moonflower/validators/ParamWrappers'

const MAX_CONTENT_LENGTH = 32000

export const NullableContentStringValidator = RequiredParam({
	parse: (v) => (v ? String(v).trim() : null),
	validate: (v) => v === null || v.length <= MAX_CONTENT_LENGTH,
	description: `Any string value up to ${MAX_CONTENT_LENGTH} characters long, or null`,
	errorMessage: `Must be at most ${MAX_CONTENT_LENGTH} characters long, or be null`,
})
