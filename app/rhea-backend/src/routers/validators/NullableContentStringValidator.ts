import { RequiredParam } from 'tenebrie-framework'

const MAX_CONTENT_LENGTH = 32000

export const NullableContentStringValidator = RequiredParam({
	rehydrate: (v) => (v ? String(v).trim() : null),
	validate: (v) => v === null || v.length <= MAX_CONTENT_LENGTH,
	description: `Any string value up to ${MAX_CONTENT_LENGTH} characters long, or null`,
	errorMessage: `Must be at most ${MAX_CONTENT_LENGTH} characters long, or be null`,
})
