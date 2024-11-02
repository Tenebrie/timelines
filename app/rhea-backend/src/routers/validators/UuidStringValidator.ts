import { RequiredParam } from 'moonflower'

export const UuidStringValidator = RequiredParam({
	parse: (v) => String(v).trim(),
	validate: (v) => v.length === 32,
	description: 'Any valid uuid string',
	errorMessage: 'Must be a valid uuid string',
})
