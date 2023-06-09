import { RequiredParam } from 'tenebrie-framework'

export const OptionalNameStringValidator = RequiredParam({
	rehydrate: (v) => v.trim(),
	validate: (v) => v.length <= 256,
	description: 'Any string value up to 256 characters long',
	errorMessage: 'Must be at most 256 characters long',
})
