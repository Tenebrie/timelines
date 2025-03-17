import { RequiredParam } from 'moonflower'

export const NullableStringValidator = RequiredParam({
	parse: (v) => (v === 'null' ? null : v),
	description: 'Any string or null value',
	errorMessage: 'Must be a valid string or null',
})
