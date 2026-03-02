import { RequiredParam } from 'moonflower/validators/ParamWrappers'

// TODO: Update Moonflower to support this pattern
// type State = {
// 	skipTrim: boolean
// }

// const createValidator = (state: State = { skipTrim: false }) => {
// 	return {
// 		...RequiredParam({
// 			parse: (v) => (v ? (state.skipTrim ? String(v) : String(v).trim()) : null),
// 			validate: (v) => v === null || (v.length >= 1 && v.length <= 256),
// 			description: 'Any string value up to 256 characters long, or null',
// 			errorMessage: 'Must be between 1 and 256 characters long, or be null',
// 		}),
// 		skipTrim() {
// 			return createValidator({ ...state, skipTrim: true })
// 		},
// 	}
// }

// export const NullableNameStringValidator = createValidator()

export const NullableNameStringValidator = RequiredParam({
	parse: (v) => (v ? String(v).trim() : null),
	validate: (v) => v === null || (v.length >= 1 && v.length <= 256),
	description: 'Any string value up to 256 characters long, or null',
	errorMessage: 'Must be between 1 and 256 characters long, or be null',
})
