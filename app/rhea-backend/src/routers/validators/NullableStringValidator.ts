import { RequiredParam } from 'moonflower/validators/ParamWrappers'

export const NullableStringValidator = RequiredParam({
	parse: (v) => (v === 'null' ? null : v),
	description: 'Any string or null value',
	errorMessage: 'Must be a valid string or null',
})
