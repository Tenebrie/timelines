import { Validator } from './types'

export const PathParam = <T>(
	validator: Omit<Validator<T>, 'optional'>
): Validator<T> & { optional: false } => ({
	...validator,
	optional: false,
})

export const RequiredParam = <T>(
	validator: Omit<Validator<T>, 'optional'>
): Validator<T> & { optional: false } => ({
	...validator,
	optional: false,
})

export const OptionalParam = <T>(
	validator: Omit<Validator<T>, 'optional'>
): Validator<T> & { optional: true } => ({
	...validator,
	optional: true,
})
