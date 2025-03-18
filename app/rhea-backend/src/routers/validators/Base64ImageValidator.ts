import { RequiredParam } from 'moonflower/validators/ParamWrappers'

export const Base64ImageValidator = RequiredParam({
	prevalidate: (v) => typeof v === 'string' && v.length > 0,
	parse: (v) => {
		if (!v) {
			throw new Error('Must be a base64-encoded binary file')
		}
		const split = v.substring(v.indexOf(',') + 1)
		return Buffer.from(split, 'base64')
	},
	description: 'A base64-encoded binary file',
	errorMessage: 'Must be a base64-encoded binary file',
})
