import { RequiredParam } from 'moonflower/validators/ParamWrappers'

export const NonNegativeIntegerValidator = RequiredParam({
	parse: (v) => Number(String(v).trim()),
	validate: (v) => Number.isInteger(v) && v >= 0,
	description: 'Any non-negative integer value',
	errorMessage: 'Must be a number greater than or equal to 0',
})
