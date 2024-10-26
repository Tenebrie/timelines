import { RequiredParam } from 'moonflower'

export const NameStringValidator = RequiredParam({
	parse: (v) => String(v).trim(),
	validate: (v) => v.length >= 3 && v.length <= 256,
	description: 'Any string value up to 256 characters long',
	errorMessage: 'Must be between 3 and 256 characters long',
})
