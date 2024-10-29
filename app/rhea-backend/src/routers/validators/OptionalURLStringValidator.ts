import { RequiredParam } from 'moonflower'

export const OptionalURLStringValidator = RequiredParam({
	parse: (v) => String(v).trim(),
	validate: (v) => v.length <= 2048,
	description: 'Any string value up to 2048 characters long',
	errorMessage: 'Must be at most 2048 characters long',
})
