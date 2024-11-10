import { RequiredParam } from 'moonflower'

export const NameStringValidator = RequiredParam({
	parse: (v) => String(v).trim(),
	validate: (v) => v.length >= 1 && v.length <= 256,
	description: 'Any string value up to 256 characters long',
	errorMessage: 'Must be between 1 and 256 characters long',
})
