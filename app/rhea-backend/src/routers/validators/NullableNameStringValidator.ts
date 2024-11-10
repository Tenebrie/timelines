import { RequiredParam } from 'moonflower'

export const NullableNameStringValidator = RequiredParam({
	parse: (v) => (v ? String(v).trim() : null),
	validate: (v) => v === null || (v.length >= 1 && v.length <= 256),
	description: 'Any string value up to 256 characters long, or null',
	errorMessage: 'Must be between 1 and 256 characters long, or be null',
})
