import { RequiredParam } from 'tenebrie-framework'

export const ActualNullableBooleanValidator = RequiredParam({
	prevalidate: (v) => v === '0' || v === '1' || v === 'false' || v === 'true' || v === null,
	rehydrate: (v) => (v === null ? null : v === '1' || v === 'true'),
	description: 'Any boolean value or null',
	errorMessage: "Must be '0', '1', 'false', 'true' or null",
})
