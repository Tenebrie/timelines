import { RequiredParam } from 'moonflower/validators/ParamWrappers'

export const NumberArrayValidator = RequiredParam({
	parse: (v) => JSON.parse(v ?? '') as number[],
	description: 'Array of number values',
	errorMessage: 'Must be an array of number values',
})
