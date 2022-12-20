/* eslint-disable @typescript-eslint/ban-ts-comment */
import { ParameterizedContext } from 'koa'

import { ValidationError } from './errors/HttpError'
import { Validator } from './validators/Validators'

type CheckIfOptional<T, B extends boolean | undefined> = B extends false ? T : T | undefined

type ValidatedData<T extends Record<string, Validator<any>>> = {
	[K in keyof T]: CheckIfOptional<ReturnType<T[K]['rehydrate']>, T[K]['optional']>
}

export const useRequestObjectBody = <ValidatorsT extends Record<string, Validator<any>>>(
	ctx: ParameterizedContext,
	validators: ValidatorsT
): ValidatedData<ValidatorsT> => {
	const providedParams = ctx.request.body || {}
	const expectedParams = Object.keys(validators)

	const missingParams = expectedParams.filter(
		(paramName) => !providedParams[paramName] && !validators[paramName].optional
	)

	if (missingParams.length > 0) {
		throw new ValidationError(`Missing body params: ${missingParams.map((param) => `'${param}'`).join(', ')}`)
	}

	const validationResults = expectedParams.map((paramName) => {
		const paramValue = providedParams[paramName] as string | number | boolean | object

		// Param is optional and is not provided - skip validation
		if (paramValue === undefined) {
			return { paramName, validated: true }
		}

		try {
			const convertedValue = typeof paramValue === 'object' ? JSON.stringify(paramValue) : String(paramValue)
			const validatorObject = validators[paramName] as Validator<any>
			const prevalidatorSuccess = !validatorObject.prevalidate || validatorObject.prevalidate(convertedValue)
			const rehydratedValue = validatorObject.rehydrate(convertedValue)
			const validatorSuccess = !validatorObject.validate || validatorObject.validate(rehydratedValue)
			return {
				paramName,
				validated: prevalidatorSuccess && validatorSuccess,
				rehydratedValue,
			}
		} catch (error) {
			return { paramName, validated: false }
		}
	})

	const failedValidations = validationResults.filter((result) => !result.validated)

	if (failedValidations.length > 0) {
		throw new ValidationError(
			`Failed body param validation: ${failedValidations.map((result) => `'${result.paramName}'`).join(', ')}`
		)
	}

	const successfulValidations = validationResults.filter((result) => result.validated)

	const returnValue = {}
	successfulValidations.forEach((result) => {
		returnValue[result.paramName] = result.rehydratedValue
	})

	return returnValue as ValidatedData<ValidatorsT>
}

export const useRequestJsonBody = useRequestObjectBody
export const useRequestFormBody = useRequestObjectBody
