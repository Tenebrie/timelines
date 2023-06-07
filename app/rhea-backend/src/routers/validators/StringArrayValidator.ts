import { RequiredParam } from 'tenebrie-framework'

export const StringArrayValidator = RequiredParam({
	rehydrate: (v) => JSON.parse(v) as string[],
	description: 'Array of string values',
	errorMessage: 'Must be an array of string values',
})
