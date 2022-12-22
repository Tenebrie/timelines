/* eslint-disable @typescript-eslint/ban-ts-comment */
import { ParameterizedContext } from 'koa'
import { ValidationError } from '../errors/UserFacingErrors'
import { Validator } from '../validators/types'

type CheckIfOptional<T, B extends boolean | undefined> = B extends false ? T : T | undefined

type ValidatedData<T extends Validator<any>> = CheckIfOptional<ReturnType<T['rehydrate']>, T['optional']>

export const useRequestRawBody = <ValidatorT extends Validator<any>>(
	ctx: ParameterizedContext,
	validator: ValidatorT
): ValidatedData<ValidatorT> => {
	const providedBody = ctx.request.rawBody
	const isOptional = validator.optional

	if (!isOptional && !providedBody) {
		throw new ValidationError('Missing required body')
	}

	const validationResult = (() => {
		try {
			const prevalidatorSuccess = !validator.prevalidate || validator.prevalidate(providedBody)
			const rehydratedValue = validator.rehydrate(providedBody)
			const validatorSuccess = !validator.validate || validator.validate(rehydratedValue)
			return {
				validated: prevalidatorSuccess && validatorSuccess,
				rehydratedValue,
			}
		} catch (error) {
			return { validated: false }
		}
	})()

	if (!validationResult.validated) {
		throw new ValidationError('Failed raw body validation.')
	}
	return validationResult.rehydratedValue as ValidatedData<ValidatorT>
}
