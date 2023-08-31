import { RequiredParam } from 'tenebrie-framework'

export const NullableNameStringValidator = RequiredParam({
	rehydrate: (v) => (v ? String(v).trim() : null),
	validate: (v) => v === null || (v.length >= 3 && v.length <= 256),
	description: 'Any string value up to 256 characters long, or null',
	errorMessage: 'Must be between 3 and 256 characters long, or be null',
})
