import { RequiredParam } from 'moonflower/validators/ParamWrappers'

export const NullableUuidStringValidator = RequiredParam({
	parse: (v) => (v === null ? v : String(v).trim()),
	validate: (v) => v === null || v.length === 36,
	description: 'Any valid uuid string or null value',
	errorMessage: 'Must be a valid uuid string or null value',
})
