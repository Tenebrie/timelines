import { RequiredParam } from 'moonflower/validators/ParamWrappers'

export const NullableEventTrackValidator = RequiredParam({
	parse: (v) => {
		if (v === null || v === 'default') {
			return null
		}
		return String(v).trim()
	},
	validate: (v) => v === null || v.length === 36 || v === 'default',
	description: 'Any valid uuid string or null value',
	errorMessage: 'Must be a valid uuid string or null value',
})
