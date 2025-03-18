import { RequiredParam } from 'moonflower/validators/ParamWrappers'

export const StringArrayValidator = RequiredParam({
	parse: (v) => JSON.parse(v ?? '') as string[],
	description: 'Array of string values',
	errorMessage: 'Must be an array of string values',
})
