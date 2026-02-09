import { RequiredParam } from 'moonflower/validators/ParamWrappers'

export const NullableNameStringWithoutTrimValidator = RequiredParam({
	parse: (v) => (v ? String(v) : null),
	validate: (v) => v === null || (v.length >= 1 && v.length <= 256),
	description: 'Any string value up to 256 characters long, or null',
	errorMessage: 'Must be between 1 and 256 characters long, or be null',
})
